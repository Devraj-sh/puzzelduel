import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { GameSocket, ConnectionStatus as ConnectionStatusType } from "@/lib/gameSocket";

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatusType>('disconnected');

  useEffect(() => {
    const socket = GameSocket.getInstance();
    
    // Listen to status changes
    socket.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Connecting',
          variant: 'outline' as const,
          className: 'border-yellow-500/50 text-yellow-400'
        };
      case 'error':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Error',
          variant: 'destructive' as const,
          className: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Disconnected',
          variant: 'outline' as const,
          className: 'border-gray-500/50 text-gray-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1.5 ${config.className}`}
    >
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
};
