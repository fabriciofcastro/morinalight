"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { Label } from "@/shared/ui/base/label";
import { MapPin, Plus, Search, Trash2, Map } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InteractiveMap } from "@/components/maps/InteractiveMap";

interface Address {
  id: string;
  tipo: "matriz" | "filial" | "entrega" | "cobranca";
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

interface CompanyAddressesForm {
  enderecos: Address[];
}

export function CompanyAddressesTab() {
  const [searchingCep, setSearchingCep] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedAddressForMap, setSelectedAddressForMap] = useState<Address | null>(null);

  const form = useForm<CompanyAddressesForm>({
    defaultValues: {
      enderecos: [
        {
          id: "1",
          tipo: "matriz",
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          pais: "Brasil",
        },
      ],
    },
  });

  const enderecos = form.watch("enderecos");

  const handleSearchCep = async (index: number) => {
    const cep = enderecos[index]?.cep?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) {
      return;
    }

    setSearchingCep(`${index}`);
    try {
      // TODO: Integrar com API ViaCEP ou similar
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        form.setValue(`enderecos.${index}.logradouro`, data.logradouro || "");
        form.setValue(`enderecos.${index}.bairro`, data.bairro || "");
        form.setValue(`enderecos.${index}.cidade`, data.localidade || "");
        form.setValue(`enderecos.${index}.estado`, data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setSearchingCep(null);
    }
  };

  const addAddress = (tipo: Address["tipo"]) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      tipo,
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
    };
    form.setValue("enderecos", [...enderecos, newAddress]);
  };

  const removeAddress = (id: string) => {
    form.setValue(
      "enderecos",
      enderecos.filter((addr) => addr.id !== id),
    );
  };

  const onSubmit = async (data: CompanyAddressesForm) => {
    // TODO: Salvar endereços via API
    console.log("Salvando endereços:", data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Endereço Matriz */}
        {enderecos
          .filter((addr) => addr.tipo === "matriz")
          .map((address, index) => {
            const actualIndex = enderecos.findIndex((a) => a.id === address.id);
            return (
              <GlassCard key={address.id} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Endereço Matriz</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAddressForMap(address);
                        setMapOpen(true);
                      }}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      Ver no Mapa
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`enderecos.${actualIndex}.cep`)}
                        placeholder="00000-000"
                        maxLength={9}
                        onBlur={() => handleSearchCep(actualIndex)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleSearchCep(actualIndex)}
                        disabled={searchingCep === `${actualIndex}`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input
                      {...form.register(`enderecos.${actualIndex}.logradouro`)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label>Número</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.numero`)} placeholder="235" />
                  </div>

                  <div>
                    <Label>Complemento</Label>
                    <Input
                      {...form.register(`enderecos.${actualIndex}.complemento`)}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div>
                    <Label>Bairro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.bairro`)} placeholder="Bom Retiro" />
                  </div>

                  <div>
                    <Label>Cidade</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.cidade`)} placeholder="São Paulo" />
                  </div>

                  <div>
                    <Label>Estado</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.estado`)} placeholder="SP" maxLength={2} />
                  </div>

                  <div>
                    <Label>País</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.pais`)} placeholder="Brasil" />
                  </div>
                </div>
              </GlassCard>
            );
          })}

        {/* Filiais */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Filiais</h3>
          <Button
            type="button"
            onClick={() => addAddress("filial")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Filial
          </Button>
        </div>

        {enderecos
          .filter((addr) => addr.tipo === "filial")
          .map((address, index) => {
            const actualIndex = enderecos.findIndex((a) => a.id === address.id);
            return (
              <GlassCard key={address.id} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-white">Filial {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`enderecos.${actualIndex}.cep`)}
                        placeholder="00000-000"
                        maxLength={9}
                        onBlur={() => handleSearchCep(actualIndex)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleSearchCep(actualIndex)}
                        disabled={searchingCep === `${actualIndex}`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.logradouro`)} />
                  </div>

                  <div>
                    <Label>Número</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.numero`)} />
                  </div>

                  <div>
                    <Label>Complemento</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.complemento`)} />
                  </div>

                  <div>
                    <Label>Bairro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.bairro`)} />
                  </div>

                  <div>
                    <Label>Cidade</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.cidade`)} />
                  </div>

                  <div>
                    <Label>Estado</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.estado`)} maxLength={2} />
                  </div>

                  <div>
                    <Label>País</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.pais`)} />
                  </div>
                </div>
              </GlassCard>
            );
          })}

        {/* Endereços de Entrega */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Endereços de Entrega</h3>
          <Button
            type="button"
            onClick={() => addAddress("entrega")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Endereço de Entrega
          </Button>
        </div>

        {enderecos
          .filter((addr) => addr.tipo === "entrega")
          .map((address, index) => {
            const actualIndex = enderecos.findIndex((a) => a.id === address.id);
            return (
              <GlassCard key={address.id} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-white">Endereço de Entrega {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`enderecos.${actualIndex}.cep`)}
                        placeholder="00000-000"
                        maxLength={9}
                        onBlur={() => handleSearchCep(actualIndex)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleSearchCep(actualIndex)}
                        disabled={searchingCep === `${actualIndex}`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.logradouro`)} />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.numero`)} />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.complemento`)} />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.bairro`)} />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.cidade`)} />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.estado`)} maxLength={2} />
                  </div>
                  <div>
                    <Label>País</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.pais`)} />
                  </div>
                </div>
              </GlassCard>
            );
          })}

        {/* Endereços de Cobrança */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Endereços de Cobrança</h3>
          <Button
            type="button"
            onClick={() => addAddress("cobranca")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Endereço de Cobrança
          </Button>
        </div>

        {enderecos
          .filter((addr) => addr.tipo === "cobranca")
          .map((address, index) => {
            const actualIndex = enderecos.findIndex((a) => a.id === address.id);
            return (
              <GlassCard key={address.id} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-white">Endereço de Cobrança {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAddressForMap(address);
                        setMapOpen(true);
                      }}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      Ver no Mapa
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeAddress(address.id)}
                      className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        {...form.register(`enderecos.${actualIndex}.cep`)}
                        placeholder="00000-000"
                        maxLength={9}
                        onBlur={() => handleSearchCep(actualIndex)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleSearchCep(actualIndex)}
                        disabled={searchingCep === `${actualIndex}`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.logradouro`)} />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.numero`)} />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.complemento`)} />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.bairro`)} />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.cidade`)} />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.estado`)} maxLength={2} />
                  </div>
                  <div>
                    <Label>País</Label>
                    <Input {...form.register(`enderecos.${actualIndex}.pais`)} />
                  </div>
                </div>
              </GlassCard>
            );
          })}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Descartar Alterações
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>

      {/* Mapa Interativo */}
      {mapOpen && selectedAddressForMap && (
        <div className="mt-6">
          <InteractiveMap
            address={{
              cep: selectedAddressForMap.cep,
              logradouro: selectedAddressForMap.logradouro,
              numero: selectedAddressForMap.numero,
              complemento: selectedAddressForMap.complemento,
              bairro: selectedAddressForMap.bairro,
              cidade: selectedAddressForMap.cidade,
              estado: selectedAddressForMap.estado,
              pais: selectedAddressForMap.pais,
            }}
            onClose={() => {
              setMapOpen(false);
              setSelectedAddressForMap(null);
            }}
            height="500px"
          />
        </div>
      )}
    </div>
  );
}




