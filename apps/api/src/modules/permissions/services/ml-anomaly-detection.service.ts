import * as tf from '@tensorflow/tfjs-node';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

export interface AnomalyPrediction {
    userId: string;
    userEmail: string;
    anomalyType: string;
    probability: number;
    confidence: 'low' | 'medium' | 'high';
    predictedAt: Date;
    features: Record<string, number>;
}

export interface TrainingData {
    features: number[][];
    labels: number[];
    metadata: {
        totalSamples: number;
        anomalyRate: number;
        featureNames: string[];
    };
}

/**
 * Serviço de Machine Learning para detecção de anomalias
 * Usa TensorFlow.js para treinar e executar modelos de detecção
 */
@Injectable()
export class MLAnomalyDetectionService {
    private model: tf.LayersModel | null = null;
    private isModelTrained = false;
    private featureNames: string[] = [
        'permissionCount',
        'roleCount',
        'criticalPermissions',
        'recentChanges',
        'unusualPatterns',
        'accessFrequency',
        'timeOfDayScore',
        'departmentDeviation',
    ];

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Treina o modelo com dados históricos
     */
    async trainModel(orgId: string): Promise<{ success: boolean; accuracy: number }> {
        try {
            console.log('Iniciando treinamento do modelo ML...');

            // Coletar dados de treinamento
            const trainingData = await this.collectTrainingData(orgId);

            if (trainingData.features.length < 10) {
                throw new Error('Dados insuficientes para treinamento (mínimo 10 amostras)');
            }

            // Criar modelo
            this.model = this.createModel();

            // Preparar tensores
            const xs = tf.tensor2d(trainingData.features);
            const ys = tf.tensor2d(trainingData.labels.map((l) => [l]));

            // Treinar modelo
            const history = await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.2,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 0) {
                            console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
                        }
                    },
                },
            });

            // Limpar tensores
            xs.dispose();
            ys.dispose();

            this.isModelTrained = true;

            const finalLoss = history.history.loss[history.history.loss.length - 1] as number;
            const accuracy = 1 - finalLoss; // Aproximação simples

            console.log(`Modelo treinado com sucesso! Accuracy: ${(accuracy * 100).toFixed(2)}%`);

            return { success: true, accuracy };
        } catch (error) {
            console.error('Erro ao treinar modelo:', error);
            return { success: false, accuracy: 0 };
        }
    }

    /**
     * Detecta anomalias usando o modelo treinado
     */
    async detectAnomalies(orgId: string): Promise<AnomalyPrediction[]> {
        if (!this.isModelTrained || !this.model) {
            console.warn('Modelo não treinado. Treinando agora...');
            await this.trainModel(orgId);
        }

        try {
            // Buscar usuários da organização
            const users = await this.prisma.user.findMany({
                where: {
                    organizations: {
                        some: { id: orgId },
                    },
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            const predictions: AnomalyPrediction[] = [];

            for (const user of users) {
                // Extrair features do usuário
                const features = await this.extractUserFeatures(user.id, orgId);

                // Fazer predição
                const prediction = await this.predictAnomaly(features);

                if (prediction.probability > 0.7) {
                    // Threshold para anomalias
                    predictions.push({
                        userId: user.id,
                        userEmail: user.email,
                        anomalyType: 'ml_detected',
                        probability: prediction.probability,
                        confidence: this.getConfidenceLevel(prediction.probability),
                        predictedAt: new Date(),
                        features: features,
                    });
                }
            }

            return predictions;
        } catch (error) {
            console.error('Erro ao detectar anomalias:', error);
            return [];
        }
    }

    /**
     * Cria a arquitetura do modelo neural
     */
    private createModel(): tf.LayersModel {
        const model = tf.sequential();

        // Camada de entrada
        model.add(
            tf.layers.dense({
                inputShape: [this.featureNames.length],
                units: 16,
                activation: 'relu',
            }),
        );

        // Camada oculta
        model.add(
            tf.layers.dense({
                units: 8,
                activation: 'relu',
            }),
        );

        // Camada de saída (probabilidade de anomalia)
        model.add(
            tf.layers.dense({
                units: 1,
                activation: 'sigmoid',
            }),
        );

        // Compilar modelo
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }

    /**
     * Coleta dados de treinamento do histórico
     */
    private async collectTrainingData(orgId: string): Promise<TrainingData> {
        try {
            // Buscar usuários com e sem anomalias conhecidas
            const users = await this.prisma.user.findMany({
                where: {
                    organizations: {
                        some: { id: orgId },
                    },
                },
                take: 100, // Limitar para performance
            });

            const features: number[][] = [];
            const labels: number[] = [];

            for (const user of users) {
                const userFeatures = await this.extractUserFeatures(user.id, orgId);
                const hasAnomaly = await this.checkHistoricalAnomaly(user.id, orgId);

                features.push(Object.values(userFeatures));
                labels.push(hasAnomaly ? 1 : 0);
            }

            const anomalyCount = labels.filter((l) => l === 1).length;

            return {
                features,
                labels,
                metadata: {
                    totalSamples: features.length,
                    anomalyRate: anomalyCount / features.length,
                    featureNames: this.featureNames,
                },
            };
        } catch (error) {
            console.error('Erro ao coletar dados de treinamento:', error);
            return {
                features: [],
                labels: [],
                metadata: {
                    totalSamples: 0,
                    anomalyRate: 0,
                    featureNames: this.featureNames,
                },
            };
        }
    }

    /**
     * Extrai features de um usuário para o modelo
     */
    private async extractUserFeatures(
        userId: string,
        orgId: string,
    ): Promise<Record<string, number>> {
        try {
            // Contar permissões
            const permissionCount = await this.prisma.userPermission.count({
                where: { userId, orgId },
            });

            // Contar roles
            const roleCount = await this.prisma.userRole.count({
                where: { userId },
            });

            // Contar permissões críticas (mock - seria baseado em lista real)
            const criticalPermissions = Math.floor(permissionCount * 0.2);

            // Mudanças recentes (últimos 7 dias)
            const recentChanges = await this.prisma.permissionAuditLog.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            });

            // Features normalizadas (0-1)
            return {
                permissionCount: Math.min(permissionCount / 100, 1),
                roleCount: Math.min(roleCount / 10, 1),
                criticalPermissions: Math.min(criticalPermissions / 20, 1),
                recentChanges: Math.min(recentChanges / 10, 1),
                unusualPatterns: Math.random(), // Mock - seria calculado com base em padrões reais
                accessFrequency: Math.random(), // Mock - seria baseado em logs de acesso
                timeOfDayScore: Math.random(), // Mock - baseado em horários de acesso
                departmentDeviation: Math.random(), // Mock - desvio da média do departamento
            };
        } catch (error) {
            console.error('Erro ao extrair features:', error);
            // Retornar features padrão em caso de erro
            return Object.fromEntries(this.featureNames.map((name) => [name, 0]));
        }
    }

    /**
     * Verifica se usuário teve anomalias históricas
     */
    private async checkHistoricalAnomaly(userId: string, orgId: string): Promise<boolean> {
        try {
            // Verificar se há registros de anomalias nos últimos 30 dias
            const anomalyCount = await this.prisma.permissionAuditLog.count({
                where: {
                    userId,
                    orgId,
                    action: {
                        in: ['ANOMALY_DETECTED', 'VIOLATION_FOUND'],
                    },
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            });

            return anomalyCount > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Faz predição de anomalia para um conjunto de features
     */
    private async predictAnomaly(
        features: Record<string, number>,
    ): Promise<{ probability: number }> {
        if (!this.model) {
            return { probability: 0 };
        }

        try {
            const featureArray = this.featureNames.map((name) => features[name] || 0);
            const input = tf.tensor2d([featureArray]);

            const prediction = this.model.predict(input) as tf.Tensor;
            const probability = (await prediction.data())[0];

            // Limpar tensores
            input.dispose();
            prediction.dispose();

            return { probability };
        } catch (error) {
            console.error('Erro ao fazer predição:', error);
            return { probability: 0 };
        }
    }

    /**
     * Determina nível de confiança baseado na probabilidade
     */
    private getConfidenceLevel(probability: number): 'low' | 'medium' | 'high' {
        if (probability >= 0.9) return 'high';
        if (probability >= 0.75) return 'medium';
        return 'low';
    }

    /**
     * Salva o modelo treinado
     */
    async saveModel(path: string): Promise<void> {
        if (!this.model) {
            throw new Error('Nenhum modelo para salvar');
        }

        await this.model.save(`file://${path}`);
        console.log(`Modelo salvo em: ${path}`);
    }

    /**
     * Carrega um modelo previamente treinado
     */
    async loadModel(path: string): Promise<void> {
        this.model = await tf.loadLayersModel(`file://${path}/model.json`);
        this.isModelTrained = true;
        console.log(`Modelo carregado de: ${path}`);
    }
}
