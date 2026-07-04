import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function UpgradePrompt({ open, onClose, limit, planName }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Device limit reached</DialogTitle>
          <DialogDescription>
            Your {planName} plan includes up to {limit} paired {limit === 1 ? 'device' : 'devices'}. Upgrade to pair more screens, speakers, and lights.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/pricing">See upgrade options</Link>
          </Button>
          <Button variant="outline" onClick={onClose}>Not now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}