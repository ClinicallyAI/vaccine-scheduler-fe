
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { BookingFormData } from '@/lib/types';

interface SimpleContactFormProps {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const SimpleContactForm: React.FC<SimpleContactFormProps> = ({
  formData,
  updateFormData,
  onNextStep,
  onPrevStep
}) => {
  const [fullName, setFullName] = useState(formData.personalInfo.fullName || '');
  const [phone, setPhone] = useState(formData.personalInfo.phone || '');
  const [email, setEmail] = useState(formData.personalInfo.email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !email) {
      alert('Please fill in all required fields');
      return;
    }

    updateFormData({
      personalInfo: {
        ...formData.personalInfo,
        fullName,
        phone,
        email,
        bookingType: 'myself', // Always set to myself for general services
        bookerInfo: undefined // No booker info needed
      }
    });
    
    onNextStep();
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Button
        variant="outline"
        onClick={onPrevStep}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Your Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Details</h3>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue to Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleContactForm;
