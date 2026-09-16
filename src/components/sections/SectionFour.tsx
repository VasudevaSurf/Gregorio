"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";

export default function SectionFour() {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 sm:py-8 flex flex-col justify-between space-y-10">

            {/* Bio block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">

                {/* Portrait */}
                <ScrollReveal direction="up" delay={0.15}>
                    <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                        <OptimizedImage
                            src="/images/founder/founder.jpg"
                            alt="Gregorio Avanzini"
                            fill
                            className="object-cover"
                        />
                    </div>
                </ScrollReveal>

                {/* Bio copy */}
                <ScrollReveal direction="up" delay={0.3}>
                    <div className="space-y-6">
                        <span className="text-xs sm:text-sm text-amber-400 font-mono tracking-[0.25em] uppercase">
                            Meet
                        </span>

                        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
                            Gregorio Avanzini
                        </h3>

                        <p className="text-sm sm:text-base leading-relaxed text-neutral-300">
                            Gregorio is a <strong className="text-white">Fulbright Scholar</strong>, a{" "}
                            <strong className="text-white">spiritual activator</strong>, a{" "}
                            <strong className="text-white">transformational coach</strong>, and the{" "}
                            <strong className="text-white">founder</strong> of the{" "}
                            <strong className="text-white">Breath of One</strong>. He explored{" "}
                            <strong className="text-white">70 countries</strong> and attended over{" "}
                            <strong className="text-white">80 retreats</strong>, often teaching,
                            always learning. He <strong className="text-white">spoke on stages</strong>{" "}
                            all around the world, bringing the{" "}
                            <strong className="text-white">Breath of One</strong> to over{" "}
                            <strong className="text-white">8,500 people</strong>. After receiving his{" "}
                            <strong className="text-white">Masters of Architecture</strong> from the{" "}
                            <strong className="text-white">University of Michigan</strong>, where he
                            also assisted in <strong className="text-white">teaching</strong>, he
                            paused his academic career to{" "}
                            <strong className="text-white">follow his heart</strong> and{" "}
                            <strong className="text-white">embrace a new life</strong>. Trusting his
                            intuition, he took a{" "}
                            <strong className="text-white">leap of faith</strong> and created the{" "}
                            <strong className="text-white">life of his wildest dreams</strong>.
                        </p>

                        <button className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white border-b border-white/40 pb-1 hover:text-amber-200 hover:border-amber-200 transition-colors">
                            Read More
                        </button>
                    </div>
                </ScrollReveal>

            </div>
        </div>
    );
}