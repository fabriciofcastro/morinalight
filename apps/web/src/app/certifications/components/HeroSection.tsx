/**
 * Hero Section - Landing section
 */

'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SpaceshipAnimation } from './SpaceshipAnimation';

export function HeroSection() {
    const scrollToNext = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
        });
    };

    return (
        <section className="relative h-[100svh] flex flex-col items-center justify-center overflow-hidden px-3 sm:px-4">
            {/* Background Space Ship */}
            <SpaceshipAnimation />

            <div className="container mx-auto text-center z-10 flex flex-col items-center justify-between h-full max-w-7xl py-[3vh] sm:py-[4vh]">
                {/* Title Wrapper */}
                <motion.div
                    className="flex flex-col items-center justify-center w-full flex-shrink-0"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ gap: 'clamp(0.5rem, 2vh, 2rem)' }}
                >
                    <motion.div
                        className="inline-block relative cursor-pointer flex-shrink-0"
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{ fontSize: 'clamp(2rem, 8vh, 6rem)' }}
                    >
                        <div className="drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-transform hover:scale-110">🏆</div>
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-full animate-pulse" />
                    </motion.div>

                    <h1
                        className="font-black tracking-tighter cursor-default selection:bg-cyan-500/50 leading-[0.9] px-2 sm:px-4 flex-shrink-0"
                        style={{ fontSize: 'clamp(1.75rem, 10vh, 6rem)' }}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-400 drop-shadow-xl">
                            CERTIFICAÇÕES
                        </span>
                    </h1>

                    <p
                        className="text-gray-400 max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto border-l-2 border-r-2 border-cyan-500/30 bg-cyan-900/5 backdrop-blur-sm cursor-default rounded-lg flex-shrink-0"
                        style={{
                            fontSize: 'clamp(0.7rem, 2vh, 1.25rem)',
                            padding: 'clamp(0.4rem, 1.5vh, 1rem) clamp(0.75rem, 3vw, 1.5rem)'
                        }}
                    >
                        Compliance Nível Enterprise
                        <br className="hidden sm:block" />
                        <span className="hidden sm:inline"> </span>
                        <span
                            className="text-cyan-400 font-semibold tracking-wider inline-block mt-1 sm:mt-0"
                            style={{ fontSize: 'clamp(0.625rem, 1.5vh, 1rem)' }}
                        >
                            SEGURANÇA • PRIVACIDADE • ACESSIBILIDADE
                        </span>
                    </p>
                </motion.div>

                {/* Stats Preview - Fully Fluid */}
                <motion.div
                    className="flex flex-wrap justify-center cursor-pointer w-full flex-shrink min-h-0"
                    style={{ gap: 'clamp(0.5rem, 2vw, 3rem)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <StatBadge value="100%" label="Taxa de Conclusão" color="#10b981" />
                    <StatBadge value="Triplo" label="Classificação A+" color="#f59e0b" />
                    <StatBadge value="Zero" label="Vulnerabilidades" color="#6366f1" />
                </motion.div>

                {/* Scroll Indicator - Compact */}
                <motion.button
                    onClick={scrollToNext}
                    className="group relative flex flex-col items-center justify-center transition-all cursor-pointer flex-shrink-0"
                    style={{ gap: 'clamp(0.25rem, 1vh, 0.75rem)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span
                        className="uppercase text-cyan-400/70 group-hover:text-cyan-300 font-mono whitespace-nowrap"
                        style={{
                            fontSize: 'clamp(0.5rem, 1.2vh, 0.75rem)',
                            letterSpacing: '0.1em'
                        }}
                    >
                        Explorar Sistema
                    </span>

                    <div
                        className="relative rounded-full border border-cyan-500/30 bg-cyan-900/10 backdrop-blur-md group-hover:border-cyan-400/60 group-hover:bg-cyan-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                        style={{ padding: 'clamp(0.4rem, 1.5vh, 0.75rem)' }}
                    >
                        <ChevronDown
                            className="text-cyan-400 animate-bounce"
                            style={{ width: 'clamp(1rem, 3vh, 1.5rem)', height: 'clamp(1rem, 3vh, 1.5rem)' }}
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500/50 animate-[spin_3s_linear_infinite]" />
                    </div>

                    {/* Beam - scales with viewport */}
                    <div
                        className="hidden sm:block w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent"
                        style={{ height: 'clamp(1rem, 4vh, 4rem)' }}
                    />
                </motion.button>
            </div>
        </section>
    );
}

function StatBadge({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <div
            className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 flex-shrink"
            style={{
                gap: 'clamp(0.25rem, 1vh, 0.5rem)',
                minWidth: 'clamp(70px, 15vw, 100px)'
            }}
        >
            <div
                style={{
                    color,
                    textShadow: `0 0 20px ${color}80`,
                    fontSize: 'clamp(1rem, 4vh, 2.5rem)',
                    fontWeight: 'bold'
                }}
            >
                {value}
            </div>
            <div
                className="text-gray-500 text-center leading-tight"
                style={{ fontSize: 'clamp(0.55rem, 1.5vh, 0.875rem)' }}
            >
                {label}
            </div>
        </div>
    );
}
