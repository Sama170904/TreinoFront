import React, { useState } from 'react';

interface TreinoLogoProps {
    variant?: 'full' | 'compact' | 'icon';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const STITCH_LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuATlMgcbw4TDsz1gS6Ljqrbwsv6YdHW5wcBjV3ZDL_PDxW8Hddjz23lBYgtxQ6BfUnJzxV_VI7F5-uwQTxxUa43Jai8otTi2RxipT4VIfQOrL9RDuc-OrtaVzcNKX18xIZ1sGfhBvulLAy4KiiCBRSIuS6GETJIsn2t99xatqVEFRsztytfEQjdsKmLELdZPDlPeNPcX6eRZCwx_mrX64h04-yU6cDLO2bbKETJj5rgwfwgNh28s2EoSrsC2G3wEKabrarsqXVOEQ07";

const TreinoLogo: React.FC<TreinoLogoProps> = ({ variant = 'full', className = '', size = 'md' }) => {
    const [imgError, setImgError] = useState(false);

    const sizeClasses = {
        sm: { img: 'h-8 w-8', icon: 'w-8 h-8 text-lg', text: 'text-lg' },
        md: { img: 'h-12 w-12', icon: 'w-11 h-11 text-xl', text: 'text-2xl' },
        lg: { img: 'h-20 w-20', icon: 'w-16 h-16 text-3xl', text: 'text-3xl' }
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {!imgError ? (
                <img
                    src={STITCH_LOGO_URL}
                    alt="Treino Logo"
                    className={`${currentSize.img} object-contain rounded-xl transition-all hover:scale-105`}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className={`${currentSize.icon} rounded-xl bg-gradient-to-tr from-primary to-primary-hover text-white flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary-container/40`}>
                    <span className="material-symbols-outlined font-bold">fitness_center</span>
                </div>
            )}

            {variant !== 'icon' && (
                <div className="flex flex-col">
                    <span className={`font-headline font-black tracking-tight ${currentSize.text} text-slate-900 leading-none`}>
                        TREINO<span className="text-primary font-extrabold">.</span>
                    </span>
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary/80 mt-0.5">
                        Studio Fitness
                    </span>
                </div>
            )}
        </div>
    );
};

export default TreinoLogo;
