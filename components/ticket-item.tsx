"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketItem({ ticket }: { ticket: any }) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (ticket.qr_code) {
            QRCode.toDataURL(ticket.qr_code, { width: 300, margin: 1 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error("Error generating QR", err));
        }
    }, [ticket.qr_code]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    };

    return (
        <>
            <div className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col gap-1">
                    <span className="font-bold">{ticket.tier?.event?.title}</span>
                    <span className="text-sm text-muted-foreground">
                        {ticket.tier?.name} — Rang {ticket.seat_row}, Place {ticket.seat_number}
                    </span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded w-fit mt-1">ID: {ticket.qr_code.split('-')[0]}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                    <span className="font-bold text-lg text-primary">{formatPrice(ticket.tier?.price)}</span>
                    <div className="relative group cursor-zoom-in" onClick={() => setIsZoomed(true)}>
                        {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded border bg-white p-1" />
                        ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs">QR</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                            <Maximize2 size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Zoom QR Code */}
            {isZoomed && qrCodeUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsZoomed(false)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 rounded-full" 
                            onClick={() => setIsZoomed(false)}
                        >
                            <X size={20} />
                        </Button>
                        <div className="flex flex-col items-center text-center gap-2">
                            <h3 className="font-black text-xl">{ticket.tier?.event?.title}</h3>
                            <p className="text-sm text-muted-foreground">{ticket.tier?.name} — Rang {ticket.seat_row}, Place {ticket.seat_number}</p>
                        </div>
                        <img src={qrCodeUrl} alt="QR Code Zoom" className="w-64 h-64" />
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{ticket.qr_code}</span>
                    </div>
                </div>
            )}
        </>
    );
}
