import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API } from "@/App";

const SUPPORTED_EXCHANGES = [
  { id: "binance", name: "Binance" },
  { id: "gateio", name: "Gate.io" },
  { id: "huobi", name: "Huobi" },
];

export default function AddExchangeModal({ open, onOpenChange, setExchanges, fetchData }) {
  const [formData, setFormData] = useState({
    name: "",
    api_key: "",
    api_secret: "",
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    if (!formData.name || !formData.api_key || !formData.api_secret) {
      toast.error("Please fill in all fields before testing");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      await axios.post(`${API}/exchanges/test`, {
        name: formData.name,
        api_key: formData.api_key,
        api_secret: formData.api_secret,
      });
      setTestResult({ success: true, message: "Connection successful!" });
      toast.success("Connection test passed!");
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error.response?.data?.detail || "Connection failed" 
      });
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.api_key || !formData.api_secret) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/exchanges`, {
        name: formData.name,
        api_key: formData.api_key,
        api_secret: formData.api_secret,
      });
      
      setExchanges(prev => [...prev, response.data]);
      toast.success(`${formData.name} added successfully`);
      setFormData({ name: "", api_key: "", api_secret: "" });
      setTestResult(null);
      onOpenChange(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add exchange");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg uppercase tracking-tight">
            Add Exchange
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect a centralized exchange with API credentials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exchange-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              Exchange
            </Label>
            <Select
              value={formData.name}
              onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            >
              <SelectTrigger data-testid="exchange-select" className="bg-input border-border">
                <SelectValue placeholder="Select exchange" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_EXCHANGES.map((exchange) => (
                  <SelectItem key={exchange.id} value={exchange.name}>
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-xs uppercase tracking-wider text-muted-foreground">
              API Key
            </Label>
            <Input
              id="api-key"
              data-testid="api-key-input"
              placeholder="Enter API key"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              className="bg-input border-border focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-secret" className="text-xs uppercase tracking-wider text-muted-foreground">
              API Secret
            </Label>
            <div className="relative">
              <Input
                id="api-secret"
                data-testid="api-secret-input"
                type={showSecret ? "text" : "password"}
                placeholder="Enter API secret"
                value={formData.api_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, api_secret: e.target.value }))}
                className="bg-input border-border focus:border-primary font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-sm ${
              testResult.success 
                ? 'bg-success/10 border border-success/30 text-success' 
                : 'bg-destructive/10 border border-destructive/30 text-destructive'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              data-testid="test-connection-btn"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.name || !formData.api_key || !formData.api_secret}
              className="h-10 px-4 rounded-sm"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Test Connection
            </Button>
            
            <div className="flex gap-3">
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
                data-testid="submit-exchange-btn"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-sm uppercase font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
