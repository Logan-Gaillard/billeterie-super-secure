"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketItem } from "@/components/ticket-item";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

export function ReservationList({ commands }: { commands: any[] }) {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!commands || commands.length === 0) {
        return (
            <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Package size={24} />
                    </div>
                    <p className="text-muted-foreground">Vous n'avez pas encore de réservations.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {commands.map((command) => {
                const isExpanded = expandedIds.includes(command.id);
                return (
                    <Card key={command.id} className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/20 shadow-md' : 'hover:border-primary/40'}`}>
                        <CardHeader 
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'}`}
                            onClick={() => toggleExpand(command.id)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                        <Package size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg">Commande #{command.id}</CardTitle>
                                        <CardDescription>Passée le {new Date(command.created_at).toLocaleDateString('fr-FR')}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={command.status === 'completed' ? 'default' : 'outline'}>
                                        {command.status === 'completed' ? 'Payée' : command.status}
                                    </Badge>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </CardHeader>
                        {isExpanded && (
                            <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-col gap-4">
                                    {command.tickets?.map((ticket: any) => (
                                        <TicketItem key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
