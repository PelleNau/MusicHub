export interface BridgeConnectionCardProps {
  serviceName?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export function BridgeConnectionCard({
  serviceName = "Spotify",
  isConnected = false,
  onConnect,
  onDisconnect,
  className = "",
}: BridgeConnectionCardProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{serviceName}</h3>
        <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`} />
      </div>
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        {isConnected ? "Connected" : "Not connected"}
      </p>
      <button
        type="button"
        onClick={isConnected ? onDisconnect : onConnect}
        className={`w-full rounded px-4 py-2 font-medium text-white ${
          isConnected ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
