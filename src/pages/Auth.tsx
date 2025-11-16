import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [bubbles, setBubbles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    duration: number; 
    delay: number;
    opacity: number;
    direction: { x: number; y: number };
  }>>([]);
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpRole, setSignUpRole] = useState<'student' | 'staff'>('student');

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInEmail, signInPassword);
    
    if (!error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName, signUpRole);
    
    if (!error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleBackClick = () => {
    setShowBubbles(true);
    
    // Generate 30+ bubbles across the entire screen with varied properties
    const newBubbles = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // 0-100% across screen width
      y: 100 + Math.random() * 20, // Start below viewport
      size: 20 + Math.random() * 80, // 20px to 100px
      duration: 3 + Math.random() * 4, // 3-7 seconds for slow motion
      delay: Math.random() * 1, // Staggered start
      opacity: 0.3 + Math.random() * 0.4, // 0.3 to 0.7 opacity
      direction: {
        x: (Math.random() - 0.5) * 30, // Slight horizontal drift
        y: -120 - Math.random() * 50, // Float upward varying speeds
      },
    }));
    setBubbles(newBubbles);
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent to-muted p-4 relative overflow-hidden">
      {/* Bubble Back Button */}
      <motion.button
        onClick={handleBackClick}
        className="absolute top-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center group overflow-hidden"
        whileHover={{ scale: 1.1, boxShadow: "0 0 25px hsl(var(--primary) / 0.5)" }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
          boxShadow: "0 8px 20px hsl(var(--primary) / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full" />
        <ArrowLeft className="w-6 h-6 text-white relative z-10 transition-transform group-hover:-translate-x-1" />
      </motion.button>

      {/* Full-Screen Cinematic Bubble Animation */}
      <AnimatePresence>
        {showBubbles && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {bubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.x}%`,
                  background: `radial-gradient(circle at 35% 35%, 
                    rgba(255, 255, 255, ${bubble.opacity * 0.9}), 
                    hsla(var(--primary), ${bubble.opacity * 0.7}), 
                    hsla(var(--secondary), ${bubble.opacity * 0.4}))`,
                  boxShadow: `
                    inset -3px -3px 8px rgba(0, 0, 0, 0.1),
                    0 0 ${bubble.size * 0.5}px hsla(var(--primary), ${bubble.opacity * 0.4}),
                    0 ${bubble.size * 0.3}px ${bubble.size * 0.6}px hsla(var(--primary), ${bubble.opacity * 0.2})
                  `,
                  filter: `blur(${bubble.size > 60 ? 1 : 0}px)`,
                }}
                initial={{ 
                  y: `${bubble.y}vh`, 
                  x: 0,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  y: `${bubble.direction.y}vh`,
                  x: bubble.direction.x,
                  scale: [0, 1, 0.95, 1],
                  opacity: [0, bubble.opacity, bubble.opacity, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
                  opacity: {
                    times: [0, 0.1, 0.8, 1],
                  },
                }}
              >
                {/* Inner highlight for glossy effect */}
                <div 
                  className="absolute rounded-full bg-gradient-to-br from-white/50 to-transparent"
                  style={{ 
                    width: `${bubble.size * 0.4}px`,
                    height: `${bubble.size * 0.4}px`,
                    top: `${bubble.size * 0.15}px`,
                    left: `${bubble.size * 0.15}px`,
                    filter: 'blur(2px)',
                  }} 
                />
                {/* Outer glow ring */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    boxShadow: `0 0 ${bubble.size * 0.3}px ${bubble.size * 0.15}px hsla(var(--primary), ${bubble.opacity * 0.3})`,
                  }} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Brototype Complaints
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to manage complaints or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="student@brototype.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="student@brototype.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a</Label>
                  <Select value={signUpRole} onValueChange={(value) => setSignUpRole(value as 'student' | 'staff')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}