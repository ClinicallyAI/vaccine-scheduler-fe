
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Check, X } from 'lucide-react';

interface ProductRecommendationCardProps {
  pharmacyName: string;
  onRecommendationRequest: (interests: string[], specificRequests?: string) => void;
}

const INTEREST_OPTIONS = [
  'Vitamins & Supplements',
  'Pain Relief',
  'Immune Support',
  'Skin Care',
  'First Aid',
  'Cold & Flu',
  'General Health'
];

const ProductRecommendationCard: React.FC<ProductRecommendationCardProps> = ({
  pharmacyName,
  onRecommendationRequest,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [specificRequests, setSpecificRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) return;
    
    setIsSubmitting(true);
    
    // Track analytics
    console.log('Product recommendation requested:', {
      interests: selectedInterests,
      specificRequests,
      pharmacyName,
      timestamp: new Date().toISOString()
    });
    
    try {
      await onRecommendationRequest(selectedInterests, specificRequests);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit recommendation request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedInterests([]);
    setSpecificRequests('');
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <span className="font-medium">Recommendation Request Sent!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {pharmacyName} will follow up with personalized product recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="w-5 h-5" />
            What products interest you?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Select categories you're interested in:
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Specific requests (optional)
            </label>
            <textarea
              value={specificRequests}
              onChange={(e) => setSpecificRequests(e.target.value)}
              placeholder="Any specific products or health concerns..."
              className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={selectedInterests.length === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Sending...' : 'Get Recommendations'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">
              Get Personalized Recommendations
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              Your pharmacist at {pharmacyName} can recommend products that complement your vaccination and support your health goals.
            </p>
          </div>
          <ShoppingBag className="w-6 h-6 text-blue-600 ml-2 flex-shrink-0" />
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          size="sm"
          className="w-full"
        >
          Get Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendationCard;
