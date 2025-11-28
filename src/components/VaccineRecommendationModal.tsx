
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Shield, Plus } from 'lucide-react';
import { VaccineRecommendation, Service } from '@/lib/types';

interface VaccineRecommendationModalProps {
  isOpen: boolean;
  recommendation: VaccineRecommendation;
  primaryService: Service;
  recommendedService: Service;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const VaccineRecommendationModal: React.FC<VaccineRecommendationModalProps> = ({
  isOpen,
  recommendation,
  primaryService,
  recommendedService,
  onAccept,
  onDecline,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            {recommendation.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {recommendation.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key Benefits - Prominent position */}
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h3 className="font-medium text-green-900 mb-3 text-center">Why get both vaccines?</h3>
            <ul className="space-y-2">
              {recommendation.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 text-sm">Your current selection:</h4>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{primaryService.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{primaryService.duration} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Upgrade */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 text-sm">Recommended upgrade:</h4>
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <Plus className="h-4 w-4" />
                      <span>Add {recommendedService.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary/80 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Total: 15 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons - Primary CTA emphasized */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onAccept} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
              size="lg"
            >
              Get Both Vaccines
            </Button>
            <Button 
              onClick={onDecline} 
              variant="outline" 
              className="w-full text-gray-600 border-gray-300"
            >
              Just {primaryService.title.split(' ')[0]}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VaccineRecommendationModal;
