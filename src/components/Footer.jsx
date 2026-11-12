export default function Footer() {
    const year = new Date().getFullYear()

    return (
        // Tambahkan class "hidden md:block" di awal className
        <footer className="hidden md:block mt-auto border-t border-line bg-flour/60 pt-10 text-center text-sm text-ink/70 pb-4">
            <div className="mx-auto max-w-6xl px-4 space-y-3">
                <div className="flex items-center justify-center gap-2">
                    <span className="font-display text-xl text-crust">Rosie Bakery</span>
                </div>
                <p className="hand text-base text-ink/60">
                    Baked with love, shared with happiness.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink/50 pt-2 border-t border-line/50">
                    <span>&copy; {year} Rosie Bakery. All rights reserved.</span>
                    <span>&bull;</span>
                    <span>Rosita Dwi Ahyani (21120124120043)</span>
                    <span>&bull;</span>
                    <span>Kelompok 37</span>
                </div>
            </div>
        </footer>
    )
}