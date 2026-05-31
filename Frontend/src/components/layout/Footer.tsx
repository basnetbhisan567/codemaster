import { Heart, Github, Twitter, Youtube, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-4 px-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>© {currentYear} CodeMaster</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Developers
          </span>
          <Link to="/community" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Users className="w-3 h-3" />
            <span>10,450+ members</span>
          </Link>
        </div>

        {/* Right - Social Links */}
        <div className="flex items-center gap-4">
          <a href="https://discord.gg/codemaster" target="_blank" rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#5865F2] transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Discord</span>
          </a>
          <a href="https://github.com/codemaster" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://twitter.com/codemaster" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#1DA1F2] transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="https://youtube.com/@codemaster" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#FF0000] transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};