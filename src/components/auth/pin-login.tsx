
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ShieldCheck, Delete, X, Landmark, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PinLoginProps {
  onAuthenticated: () => void;
}

export function PinLogin({ onAuthenticated }: PinLoginProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'set' | 'confirm'>('enter');

  useEffect(() => {
    const checkPin = async () => {
      const config = await db.config.get('app_pin');
      if (config) {
        setStoredPin(config.value);
        setStep('enter');
      } else {
        setStep('set');
      }
    };
    checkPin();
  }, []);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinComplete();
    }
  }, [pin]);

  const handlePinComplete = async () => {
    if (step === 'enter') {
      if (pin === storedPin) {
        onAuthenticated();
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect PIN",
          description: "Please try again.",
        });
        setPin('');
      }
    } else if (step === 'set') {
      setConfirmPin(pin);
      setPin('');
      setStep('confirm');
    } else if (step === 'confirm') {
      if (pin === confirmPin) {
        await db.config.put({ key: 'app_pin', value: pin });
        toast({
          title: "PIN Set Successfully",
          description: "Your Pulse is now secured.",
        });
        onAuthenticated();
      } else {
        toast({
          variant: "destructive",
          title: "PINs Don't Match",
          description: "Start over to set your PIN.",
        });
        setPin('');
        setStep('set');
      }
    }
  };

  const KeypadButton = ({ val }: { val: string }) => (
    <Button
      variant="outline"
      className="h-16 w-16 rounded-2xl text-xl font-bold bg-white/50 border-primary/10 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 shadow-sm"
      onClick={() => handleNumberClick(val)}
    >
      {val}
    </Button>
  );

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-xs w-full space-y-6 animate-in fade-in zoom-in duration-500 pb-10">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4 shadow-inner">
            <Fingerprint className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-xs font-black text-primary uppercase tracking-[0.3em] italic">SusuPulse</h1>
          <h2 className="text-2xl font-black text-foreground">
            {step === 'enter' ? 'Welcome Back' : step === 'set' ? 'Set Access PIN' : 'Confirm PIN'}
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {step === 'enter' ? 'Enter your 4-digit code' : step === 'set' ? 'Secure your records' : 'Enter it once more'}
          </p>
        </div>

        <div className="flex justify-center gap-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-all duration-300",
                pin.length > i 
                  ? "bg-primary border-primary scale-125 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                  : "bg-muted border-muted-foreground/20"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 place-items-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
            <KeypadButton key={n} val={n} />
          ))}
          <div className="h-16 w-16" /> {/* Placeholder */}
          <KeypadButton val="0" />
          <Button
            variant="ghost"
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleDelete}
          >
            <Delete className="h-6 w-6" />
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-50 flex items-center justify-center gap-2">
            <Lock className="h-3 w-3" /> End-to-End Local Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
