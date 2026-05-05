'use client';

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRightIcon, BadgeDollarSign, Menu, X } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import PixelBackground from '@/components/ui/pixel-background';
import LogoLoop from "@/components/LogoLoop"
import StatsCount from '@/components/ui/statscount';
import TextHighlighter from '@/components/ui/text-highlighter';

import {
    Announcement,
    AnnouncementTag,
    AnnouncementTitle,
} from '@/components/ui/announcement';

const githubRepoUrl =
    (import.meta.env.VITE_GITHUB_URL as string | undefined)?.trim() || 'https://github.com';

const LANDING_NAV_SECTIONS: { label: string; id: string }[] = [
    { label: 'Features', id: 'features' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Mercado', id: 'demo' },
];

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const closeMenu = React.useCallback(() => setMenuOpen(false), []);

    const goToLandingTop = () => {
        closeMenu();
        if (pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            void navigate('/');
        }
    };

    const scrollToSection = React.useCallback(
        (sectionId: string) => {
            closeMenu();
            const el = () => {
                document.getElementById(sectionId)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            };
            if (pathname !== '/') {
                void navigate('/');
                window.setTimeout(el, 80);
            } else {
                el();
            }
        },
        [closeMenu, navigate, pathname],
    );

    React.useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu();
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [menuOpen, closeMenu]);

    const empezarButtonClass =
        'group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-zinc-100 hover:shadow-[0_4px_24px_rgba(0,0,0,0.18)] active:bg-zinc-200 md:inline-flex md:w-auto md:py-2 md:text-xs md:px-5';

    return (
        <>
            <AnimatePresence>
                {menuOpen ? (
                    <motion.button
                        key='landing-nav-backdrop'
                        type='button'
                        aria-label='Cerrar menú'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='fixed inset-0 z-40 cursor-default border-0 bg-black/50 p-0 md:hidden'
                        onClick={closeMenu}
                    />
                ) : null}
            </AnimatePresence>

            <motion.nav
                initial={{ y: -100, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className='fixed top-4 left-1/2 z-50 flex min-w-0 w-[min(94%,36rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0A09]/60 shadow-2xl backdrop-blur-xl md:w-[min(94%,44rem)]'
            >
                <div className='relative flex items-center justify-between gap-2 px-4 py-2 md:gap-4 md:px-5 md:py-2.5'>
                    <button
                        type='button'
                        onClick={goToLandingTop}
                        className='relative z-10 flex min-w-0 shrink cursor-pointer items-center gap-2 rounded-lg text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0A09]'
                        aria-label='Ir al inicio de la página'
                    >
                        <span className='text-sm font-bold tracking-wider text-white md:text-lg'>
                            FinTrend <span className='text-[#D4AF37]'>AI</span>
                        </span>
                    </button>

                    <nav
                        aria-label='Secciones'
                        className='pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex lg:gap-2'
                    >
                        {LANDING_NAV_SECTIONS.map(({ label, id }) => (
                            <button
                                key={`${label}-${id}`}
                                type='button'
                                onClick={() => scrollToSection(id)}
                                className='pointer-events-auto shrink-0 rounded-lg px-2 py-1.5 text-center text-[11px] font-medium tracking-wide text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:px-3 lg:text-xs'
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className='relative z-10 hidden shrink-0 items-center gap-2 md:flex'>
                        <a
                            href={githubRepoUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex size-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/5 hover:text-white'
                            aria-label='Ver repositorio en GitHub'
                        >
                            <FaGithub className='size-[18px]' aria-hidden />
                        </a>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to='/dashboard' className={empezarButtonClass}>
                                Empezar
                                <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                            </Link>
                        </motion.div>
                    </div>

                    <button
                        type='button'
                        className='relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition-colors hover:bg-white/5 hover:text-white md:hidden'
                        aria-expanded={menuOpen}
                        aria-controls='landing-mobile-nav'
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        {menuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {menuOpen ? (
                        <motion.div
                            key='landing-mobile-drawer'
                            id='landing-mobile-nav'
                            role='dialog'
                            aria-modal='true'
                            aria-label='Navegación'
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className='overflow-hidden border-t border-white/10 md:hidden'
                        >
                            <div className='px-4 pb-4 pt-1'>
                                <nav className='flex flex-col gap-0.5'>
                                    {LANDING_NAV_SECTIONS.map(({ label, id }) => (
                                        <button
                                            key={`m-${label}-${id}`}
                                            type='button'
                                            onClick={() => scrollToSection(id)}
                                            className='rounded-xl px-3 py-3 text-left text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5'
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </nav>
                                <div className='mt-2 border-t border-white/10 pt-3'>
                                    <a
                                        href={githubRepoUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white'
                                        onClick={closeMenu}
                                    >
                                        <FaGithub className='size-5 shrink-0' aria-hidden />
                                        GitHub
                                    </a>
                                    <motion.div whileTap={{ scale: 0.98 }}>
                                        <Link
                                            to='/dashboard'
                                            className={empezarButtonClass}
                                            onClick={closeMenu}
                                        >
                                            Empezar
                                            <ArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </motion.nav>
        </>
    );
};

const stats = [
    {
        value: 250,
        suffix: '+',
        label: 'Fuentes monitoreadas',
        duration: 5,
    },
    {
        value: 150,
        suffix: '+',
        label: 'Compañías analizadas',
        duration: 6,
    },
    {
        value: 5,
        suffix: 'k+',
        label: 'Predicciones generadas',
        duration: 5.5,
    },
];

export default function HeroSectionwithPixelBackground() {
    return (
        <div className='relative min-h-min w-full bg-white dark:bg-[#0a0a0a] overflow-hidden md:min-h-screen'>
            {/* Background Image Layer */}
            <div className='absolute inset-x-0 bottom-0 top-[160px] z-0 pointer-events-none'>
                <img
                    src="/fintechcity.png"
                    className="w-full h-full object-cover opacity-10 dark:opacity-25"
                    style={{ filter: 'grayscale(100%)', objectPosition: 'center top' }}
                />
                <div className='absolute inset-0 bg-radial-[at_center_top] from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]' />
                <div className='absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]' />
            </div>

            <div
                className='absolute inset-x-0 top-0 h-64 pointer-events-none z-10'
                style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, transparent 100%)',
                }}
            >
                <PixelBackground
                    gap={6}
                    speed={60}
                    colors='#1a1a1a,#2a2a2a,#333333,#111111, #d4d4d4,#e5e5e5,#c4c4c4,#bababa'
                    opacity={0.5}
                    direction='top'
                    className='w-full h-full absolute inset-0'
                />
            </div>

            <div className='relative flex min-h-min flex-col pt-32 z-20 md:min-h-screen md:pt-36'>
                <Navbar />
                <LogoLoop />
                <div className='h-2 shrink-0 md:h-4' aria-hidden />
                <div className='flex w-full grow-0 flex-col items-center px-4 pb-6 pt-6 md:grow md:px-6 md:pb-12 md:pt-12'>
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className='mb-12 flex items-center gap-2 md:mb-10 lg:mb-12'
                    >
                        <Announcement
                            movingBorder
                            movingBorderClassName="bg-[radial-gradient(#D4AF37_50%,transparent_70%)]"
                        >
                            <AnnouncementTag>
                                <BadgeDollarSign className="size-4 text-[#D4AF37]" />
                            </AnnouncementTag>
                            <AnnouncementTitle>
                                Analizador y predicción de bolsa
                                <ArrowUpRightIcon className='shrink-0 text-muted-foreground' size={16} />
                            </AnnouncementTitle>
                        </Announcement>
                    </motion.div>

                    <div className='flex flex-col items-center'>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className='text-zinc-900 dark:text-white text-4xl md:text-7xl font-black tracking-tight leading-none text-center'
                        >
                            No adivines el futuro,
                        </motion.h1>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.42,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className='text-[#D4AF37] text-4xl md:text-7xl font-black tracking-tight leading-none text-center underline decoration-[#D4AF37] underline-offset-8'
                        >
                            <TextHighlighter type='wavy' highlightColor='#D4AF37' strokeWidth={4}>
                                <span>predicelo.</span>
                            </TextHighlighter>
                        </motion.h1>
                        <StatsCount
                            stats={stats}
                            title='REVOLUCIONANDO EL ANÁLISIS DE MERCADO CON FINTREND AI'
                            showDividers={true}
                            className='mt-10 w-full py-1 sm:mt-14 sm:py-2 md:mt-16 lg:py-3'
                        />
                    </div>
                </div>
            </div>
            <div className='pointer-events-none absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-zinc-300/60 dark:via-zinc-700/40 to-transparent' />
        </div>
    );
}
