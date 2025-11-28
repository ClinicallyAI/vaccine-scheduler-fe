import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, Clock } from "lucide-react";
import { getServiceById } from "@/lib/data";

interface ShinglesRecommendationModalProps {
  isOpen: boolean;
  age: number;
  selectedServiceId: string;
  onAccept: () => void;
  onDecline: () => void;
  onReminder?: () => void;
  onClose: () => void;
}

const ShinglesRecommendationModal: React.FC<ShinglesRecommendationModalProps> = ({
  isOpen,
  age,
  selectedServiceId,
  onAccept,
  onDecline,
  onReminder,
  onClose,
}) => {
  const selectedService = getServiceById(selectedServiceId);
  const shinglesService = getServiceById("6");

  const is64YearsOld = age === 64;
  const is65Plus = age >= 65;

  if (!selectedService || !shinglesService) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">{is64YearsOld ? "Shingles Vaccine Reminder" : "Add Shingles Vaccination?"}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {is64YearsOld ? (
              <>
                Great news! You'll be eligible for a <Badge variant="secondary">FREE</Badge> shingles vaccination when you turn 65. This
                vaccine helps protect against shingles and its complications.
              </>
            ) : (
              <>
                Since you're {age} years old, you're eligible for the shingles vaccination. Would you like to add this to your appointment
                today?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Your Current Selection:</h3>
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedService.name}</span>
              <Badge variant="outline">{selectedService.duration_minutes} min</Badge>
            </div>
          </div>

          {/* Shingles Information */}
          <div className="border border-primary/20 bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {shinglesService.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{shinglesService.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{shinglesService.duration_minutes} minutes</span>
              </div>
              <Badge variant="secondary">FREE for 65+</Badge>
            </div>
          </div>

          {is65Plus && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Please note:</strong> Our pharmacist will review whether both vaccinations can be safely administered on the same
                day, or if they should be scheduled separately.
              </p>
            </div>
          )}

          {is64YearsOld && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Birthday Reminder Service</span>
              </div>
              <p className="text-sm text-green-700">
                We can send you a reminder on your 65th birthday about your free shingles vaccination eligibility.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {is64YearsOld ? (
            <>
              <Button variant="outline" onClick={onDecline} className="flex-1">
                No Thanks
              </Button>
              {onReminder && (
                <Button onClick={onReminder} className="flex-1" variant="secondary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Send Birthday Reminder
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onDecline} className="flex-1">
                Not Today
              </Button>
              <Button onClick={onAccept} className="flex-1">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Add Shingles Vaccine
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShinglesRecommendationModal;
