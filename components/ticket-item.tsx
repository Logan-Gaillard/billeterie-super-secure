"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function TicketItem({ ticket }: { ticket: any }) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    useEffect(() => {
        if (ticket.qr_code) {
            QRCode.toDataURL(ticket.qr_code, { width: 100, margin: 1 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error("Error generating QR", err));
        }
    }, [ticket.qr_code]);

    return (
        <div className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
            <div className="flex flex-col gap-1">
                <span className="font-bold">{ticket.tier?.event?.title}</span>
                <span className="text-sm text-muted-foreground">{ticket.tier?.name} - Rang {ticket.seat_row}, Siège {ticket.seat_number}</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded w-fit mt-1">ID: {ticket.qr_code.split('-')[0]}</span>
            </div>
            <div className="flex items-center gap-4 text-right">
                <span className="font-bold text-lg">{ticket.tier?.price}€</span>
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded" />
                ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs">QR</div>
                )}
            </div>
        </div>
    );
}
