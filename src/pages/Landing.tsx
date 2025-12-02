import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Upload, UserCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Delete My Ex
          </h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Use AI-powered facial recognition to find and remove all photos of your ex. 
          It's time to move forward.
        </p>
      </div>

      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-4 pb-24">
        {/* Feature Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Take Control of Your Photos
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Upload your photos, mark your ex's face, and let AI do the rest. 
            Quick, private, and empowering.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          {/* Step 1 */}
          <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Photos
              </h3>
              <p className="text-muted-foreground">
                Select photos from your device
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">2</span>
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Mark Your Ex
              </h3>
              <p className="text-muted-foreground">
                AI detects faces, you select the one to remove
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">3</span>
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                Delete & Move On
              </h3>
              <p className="text-muted-foreground">
                Watch those memories disappear
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={() => navigate('/scan')}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-12 py-6 text-lg shadow-glow"
          >
            <Upload className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
