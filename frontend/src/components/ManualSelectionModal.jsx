import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API } from "@/App";

export default function ManualSelectionModal({ open, onOpenChange, tokens, exchanges, setOpportunities }) {
  const [selectedToken, setSelectedToken] = useState("");
  const [buyExchange, setBuyExchange] = useState("");
  const [sellExchange, setSellExchange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedToken || !buyExchange || !sellExchange) {
      toast.error("Please select all fields");
      return;
    }

    if (buyExchange === sellExchange) {
      toast.error("Buy and sell exchanges must be different");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/arbitrage/manual-selection`, {
        token_id: selectedToken,
        buy_exchange: buyExchange,
        sell_exchange: sellExchange
      });
      
      setOpportunities(prev => [response.data, ...prev]);
      toast.success("Manual selection created successfully");
      setSelectedToken("");
      setBuyExchange("");
      setSellExchange("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create manual selection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTokenData = tokens.find(t => t.id === selectedToken);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            Manual CEX Selection
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manually select buy and sell exchanges for arbitrage
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Token
            </Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger data-testid="select-token" className="bg-input border-border">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.length === 0 ? (
                  <SelectItem value="none" disabled>No tokens available</SelectItem>
                ) : (
                  tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Exchange Selection */}
          <div className="grid grid-cols-5 gap-3 items-end">
            {/* Buy Exchange */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs uppercase tracking-wider text-success">
                Buy Exchange
              </Label>
              <Select value={buyExchange} onValueChange={setBuyExchange}>
                <SelectTrigger data-testid="select-buy-exchange" className="bg-input border-border border-success/30">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.length === 0 ? (
                    <SelectItem value="none" disabled>No exchanges</SelectItem>
                  ) : (
                    exchanges.map((exchange) => (
                      <SelectItem 
                        key={exchange.id} 
                        value={exchange.name}
                        disabled={exchange.name === sellExchange}
                      >
                        {exchange.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Arrow */}
            <div className="flex justify-center items-center pb-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>

            {/* Sell Exchange */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs uppercase tracking-wider text-destructive">
                Sell Exchange
              </Label>
              <Select value={sellExchange} onValueChange={setSellExchange}>
                <SelectTrigger data-testid="select-sell-exchange" className="bg-input border-border border-destructive/30">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.length === 0 ? (
                    <SelectItem value="none" disabled>No exchanges</SelectItem>
                  ) : (
                    exchanges.map((exchange) => (
                      <SelectItem 
                        key={exchange.id} 
                        value={exchange.name}
                        disabled={exchange.name === buyExchange}
                      >
                        {exchange.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {selectedTokenData && buyExchange && sellExchange && (
            <div className="p-3 rounded-sm bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="font-mono text-success">{buyExchange}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-bold text-white">{selectedTokenData.symbol}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-destructive">{sellExchange}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 rounded-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="create-selection-btn"
              disabled={isSubmitting || !selectedToken || !buyExchange || !sellExchange}
              className="bg-warning text-black hover:bg-warning/90 h-10 px-6 rounded-sm uppercase font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" strokeWidth={1.5} />
              )}
              Create Selection
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
