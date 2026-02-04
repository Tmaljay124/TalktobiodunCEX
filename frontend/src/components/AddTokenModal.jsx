import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { API } from "@/App";

export default function AddTokenModal({ open, onOpenChange, exchanges, setTokens, fetchData }) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    contract_address: "",
    monitored_exchanges: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExchangeToggle = (exchangeName) => {
    setFormData(prev => ({
      ...prev,
      monitored_exchanges: prev.monitored_exchanges.includes(exchangeName)
        ? prev.monitored_exchanges.filter(e => e !== exchangeName)
        : [...prev.monitored_exchanges, exchangeName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.symbol || !formData.contract_address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/tokens`, {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        contract_address: formData.contract_address,
        monitored_exchanges: formData.monitored_exchanges
      });
      
      setTokens(prev => [...prev, response.data]);
      toast.success(`Token ${formData.symbol} added successfully`);
      setFormData({ name: "", symbol: "", contract_address: "", monitored_exchanges: [] });
      onOpenChange(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add token");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg uppercase tracking-tight">
            Add BEP20 Token
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new token to monitor for arbitrage opportunities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              Token Name
            </Label>
            <Input
              id="token-name"
              data-testid="token-name-input"
              placeholder="e.g., Binance Coin"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-input border-border focus:border-primary font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-symbol" className="text-xs uppercase tracking-wider text-muted-foreground">
              Symbol
            </Label>
            <Input
              id="token-symbol"
              data-testid="token-symbol-input"
              placeholder="e.g., BNB"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="bg-input border-border focus:border-primary font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-address" className="text-xs uppercase tracking-wider text-muted-foreground">
              Contract Address
            </Label>
            <Input
              id="contract-address"
              data-testid="contract-address-input"
              placeholder="0x..."
              value={formData.contract_address}
              onChange={(e) => setFormData(prev => ({ ...prev, contract_address: e.target.value }))}
              className="bg-input border-border focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Exchanges to Monitor
            </Label>
            <div className="space-y-2">
              {exchanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exchanges available. Add exchanges first.</p>
              ) : (
                exchanges.map((exchange) => (
                  <div key={exchange.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exchange-${exchange.id}`}
                      data-testid={`exchange-checkbox-${exchange.name}`}
                      checked={formData.monitored_exchanges.includes(exchange.name)}
                      onCheckedChange={() => handleExchangeToggle(exchange.name)}
                    />
                    <label
                      htmlFor={`exchange-${exchange.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {exchange.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

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
              data-testid="submit-token-btn"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-sm uppercase font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Token
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
