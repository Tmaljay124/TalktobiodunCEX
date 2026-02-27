import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Bell, 
  Shield, 
  Sliders, 
  Send, 
  CheckCircle, 
  XCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Target,
  Clock,
  Timer,
  TrendingDown,
  Fuel
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/App";

export default function SettingsModal({ open, onOpenChange, settings, updateSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("trading");

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!localSettings.telegram_chat_id) {
      toast.error("Please enter a Telegram Chat ID first");
      return;
    }

    setIsTesting(true);
    setTelegramTestStatus(null);
    
    try {
      const response = await axios.post(`${API}/telegram/test?chat_id=${localSettings.telegram_chat_id}`);
      setTelegramTestStatus("success");
      toast.success("Test notification sent! Check your Telegram.");
    } catch (error) {
      setTelegramTestStatus("error");
      toast.error(error.response?.data?.detail || "Failed to send test notification");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] bg-card border-border overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" strokeWidth={1.5} />
            Bot Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="trading" className="font-mono text-xs">
              <Sliders className="w-4 h-4 mr-2" />
              Trading & Mode
            </TabsTrigger>
            <TabsTrigger value="failsafe" className="font-mono text-xs">
              <Target className="w-4 h-4 mr-2" />
              Fail-Safe & Alerts
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            {/* TAB 1: Trading & Mode */}
            <TabsContent value="trading" className="space-y-6 mt-0">
              {/* Trading Mode Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Trading Mode</h3>
                </div>
                
                <div 
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    localSettings.is_live_mode 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : 'bg-yellow-500/10 border-yellow-500/50'
                  }`}
                  onClick={() => setLocalSettings(prev => ({ ...prev, is_live_mode: !prev.is_live_mode }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {localSettings.is_live_mode ? (
                        <ToggleRight className="w-6 h-6 text-red-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-yellow-400" />
                      )}
                      <div>
                        <p className={`font-semibold ${localSettings.is_live_mode ? 'text-red-400' : 'text-yellow-400'}`}>
                          {localSettings.is_live_mode ? 'LIVE MODE' : 'TEST MODE'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {localSettings.is_live_mode 
                            ? 'Real orders will be placed on exchanges' 
                            : 'Simulated trades only - no real orders'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {localSettings.is_live_mode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-2 rounded-sm bg-red-500/10 border border-red-500/30 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">
                        Warning: Live mode uses real funds. Ensure you understand the risks before proceeding.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Trading Parameters Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Trading Parameters</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Min Spread Threshold (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="0.5"
                      value={localSettings.min_spread_threshold || 0.5}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, min_spread_threshold: parseFloat(e.target.value) }))}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum spread % to detect opportunity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Max Trade Amount ($)</Label>
                    <Input
                      type="number"
                      step="100"
                      min="10"
                      placeholder="1000"
                      value={localSettings.max_trade_amount || 1000}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, max_trade_amount: parseFloat(e.target.value) }))}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum USDT per trade
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Slippage Tolerance (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5"
                      placeholder="0.5"
                      value={localSettings.slippage_tolerance || 0.5}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, slippage_tolerance: parseFloat(e.target.value) }))}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max price change allowed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      Min BNB for Gas
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1"
                      placeholder="0.05"
                      value={localSettings.min_bnb_for_gas || 0.05}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, min_bnb_for_gas: parseFloat(e.target.value) }))}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Min BNB required for gas fees
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Fail-Safe & Alerts */}
            <TabsContent value="failsafe" className="space-y-6 mt-0">

              {/* Fail-Safe Arbitrage Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Fail-Safe Arbitrage</h3>
                </div>

                <div className="p-4 rounded-sm border border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs text-muted-foreground mb-4">
                    The bot monitors spread continuously and only sells when target is reached. This protects your investment by ensuring favorable conditions.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target Sell Spread (%)
                      </Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="10"
                        placeholder="2"
                        value={localSettings.target_sell_spread || 2}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, target_sell_spread: parseFloat(e.target.value) }))}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Sell when spread hits this % (realistic: 1-3%)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Stop-Loss Spread (%)
                      </Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="-10"
                        max="0"
                        placeholder="-2"
                        value={localSettings.stop_loss_spread || -2}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, stop_loss_spread: parseFloat(e.target.value) }))}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Abort if spread drops below this (negative)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Check Interval (seconds)
                      </Label>
                      <Input
                        type="number"
                        step="5"
                        min="5"
                        max="60"
                        placeholder="10"
                        value={localSettings.spread_check_interval || 10}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, spread_check_interval: parseInt(e.target.value) }))}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        How often to check spread
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Max Wait Time (seconds)
                      </Label>
                      <Input
                        type="number"
                        step="60"
                        min="300"
                        max="3600"
                        placeholder="600"
                        value={localSettings.max_wait_time || 600}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, max_wait_time: parseInt(e.target.value) }))}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        If target not reached, sell anyway (fail-safe)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telegram Notifications Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Telegram Notifications</h3>
                </div>

                <div className="space-y-3 p-4 rounded-sm border border-border bg-secondary/30">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setLocalSettings(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  >
                    <div className="flex items-center gap-2">
                      {localSettings.telegram_enabled ? (
                        <ToggleRight className="w-5 h-5 text-blue-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="text-sm">Enable Telegram Notifications</span>
                    </div>
                  </div>

                  {localSettings.telegram_enabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Chat ID</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter your Telegram Chat ID"
                            value={localSettings.telegram_chat_id || ''}
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                            className="bg-background border-border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestTelegram}
                            disabled={isTesting || !localSettings.telegram_chat_id}
                            className="flex-shrink-0"
                          >
                            {isTesting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : telegramTestStatus === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : telegramTestStatus === 'error' ? (
                              <XCircle className="w-4 h-4 text-destructive" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          To get your Chat ID, start a chat with @userinfobot on Telegram
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
