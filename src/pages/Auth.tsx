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
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
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
    
    // Generate random bubbles
    const newBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    setBubbles(newBubbles);
    
    // Navigate after animation
    setTimeout(() => {
      navigate('/');
    }, 800);
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

      {/* Floating Bubbles Animation */}
      <AnimatePresence>
        {showBubbles && bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute w-8 h-8 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), hsl(var(--primary) / 0.6))",
              boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.1), 0 4px 8px hsl(var(--primary) / 0.3)",
              left: '50%',
              top: '50%',
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              x: bubble.x * 3,
              y: bubble.y * 3,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" style={{ clipPath: 'circle(30% at 25% 25%)' }} />
          </motion.div>
        ))}
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