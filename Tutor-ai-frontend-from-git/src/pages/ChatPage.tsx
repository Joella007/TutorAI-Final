import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Send, Plus, Search, MoreVertical, ThumbsUp, ThumbsDown, Copy, Sparkles, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }
interface Conversation {
  session_id: string;
  id_interaction: string; // Utilisé par Dashboard pour la rétrocompatibilité
  question_utilisateur: string;
  date_interaction: string;
  messages: { id: number, question: string, reponse: string }[];
}
interface Matiere { id: number; id_matiere?: number; name?: string; nom_matiere?: string; }

// Générateur d'ID unique pour la session
const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'sess_' + Date.now();
}

function groupByDate(conversations: Conversation[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return {
    today: conversations.filter(i => i?.date_interaction && new Date(i.date_interaction).toDateString() === today),
    yesterday: conversations.filter(i => i?.date_interaction && new Date(i.date_interaction).toDateString() === yesterday),
    older: conversations.filter(i => i?.date_interaction && new Date(i.date_interaction).toDateString() !== today && new Date(i.date_interaction).toDateString() !== yesterday),
  };
}

const FormattedText = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, index) => {
        const isBullet = line.startsWith('- ') || line.startsWith('* ');
        const renderBold = (text: string) => {
          return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
            return part;
          });
        };

        if (isBullet) {
          return (
            <div key={index} className="flex gap-2.5 ml-2 mt-0.5">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-current shrink-0 opacity-70" />
              <div className="text-[15px] leading-relaxed">{renderBold(line.substring(2).trim())}</div>
            </div>
          );
        }
        return <p key={index} className="text-[15px] leading-relaxed mt-1">{renderBold(line)}</p>;
      })}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-2">
    {[0, 0.2, 0.4].map((delay, i) => (
      <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} className="h-2 w-2 rounded-full bg-primary" />
    ))}
  </div>
);

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('');
  
  const [activeCoursId, setActiveCoursId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NOUVEAU : On gère la session active (le thread)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string>(generateId());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const cId = searchParams.get('cours_id');
    if (cId) {
      setActiveCoursId(Number(cId));
      setInput(`J'aimerais faire des révisions sur ce cours. Que me conseilles-tu ?`);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [searchParams]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, matRes] = await Promise.allSettled([
          api.get('/ai/chat/history'),
          api.get('/matieres/disponibles', { params: { id_niveau: (user as any)?.id_niveau, id_filiere: (user as any)?.id_filiere } }),
        ]);

        if (histRes.status === 'fulfilled') setHistory(histRes.value.data?.data ?? histRes.value.data ?? []);
        
        if (matRes.status === 'fulfilled') {
          const rawData = matRes.value.data?.data ?? matRes.value.data ?? [];
          if (rawData.length > 0) {
            setMatieres(rawData);
            setSelectedMatiere(String(rawData[0].id ?? rawData[0].id_matiere));
          }
        }
      } catch (err) {
        console.error('Chat init error:', err);
      }
    };
    fetchData();
  }, [user]);

  // NOUVEAU : Chargement de tous les messages de la conversation !
  const loadConversation = (conv: Conversation) => {
    setActiveSessionId(conv.session_id);
    currentSessionIdRef.current = conv.session_id; // On indique à React qu'on écrit dans cette ancienne discussion
    
    const loadedMessages: Message[] = [];
    conv.messages.forEach(m => {
        loadedMessages.push({ id: `u-${m.id}`, role: 'user', content: m.question, timestamp: new Date() });
        loadedMessages.push({ id: `a-${m.id}`, role: 'assistant', content: m.reponse, timestamp: new Date() });
    });
    setMessages(loadedMessages);
  };

  const handleNewChat = () => { 
    setActiveSessionId(null); 
    setMessages([]); 
    setInput(''); 
    currentSessionIdRef.current = generateId(); // Génère un nouvel ID pour la nouvelle discussion !
  };

  const handleDeleteChat = async (idToDelete: string) => {
    try {
      await api.delete(`/ai/chat/history/${idToDelete}`);
      setHistory(h => h.filter(i => i.session_id !== idToDelete));
      if (activeSessionId === idToDelete) {
        setActiveSessionId(null);
        setMessages([]);
        currentSessionIdRef.current = generateId();
      }
      toast({ title: 'Supprimé', description: 'La discussion a été effacée de votre historique.' });
    } catch (error) {
      setHistory(h => h.filter(i => i.session_id !== idToDelete));
      if (activeSessionId === idToDelete) handleNewChat();
      toast({ title: 'Supprimé', description: 'Discussion retirée de l\'affichage.' });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setMessages(p => [...p, { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date() }]);
    setInput('');
    setIsTyping(true);

    try {
      const payload: any = { 
        message: text, 
        with_history: true,
        session_id: currentSessionIdRef.current // 👈 On envoie le SessionID !
      };
      if (activeCoursId) payload.id_cours = activeCoursId;
      if (!activeCoursId && selectedMatiere) payload.id_matiere = parseInt(selectedMatiere);

      const res = await api.post('/ai/chat', payload);
      setMessages(p => [...p, { id: `a-${Date.now()}`, role: 'assistant', content: res.data?.data?.ai_response, timestamp: new Date() }]);
      
      // On rafraichit l'historique de gauche
      api.get('/ai/chat/history').then(r => setHistory(r.data?.data ?? []));
      setActiveSessionId(currentSessionIdRef.current);
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'envoyer le message.", variant: 'destructive' });
    } finally {
      setIsTyping(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copié !', description: 'Message copié dans le presse-papier.' });
  };

  const grouped = groupByDate(history.filter(i => i.question_utilisateur?.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 lg:-m-8">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }} className="flex flex-col border-r border-border/60 bg-card/50">
            <div className="p-4"><Button onClick={handleNewChat} className="w-full gradient-primary text-white gap-2 shadow-sm"><Plus className="h-4 w-4" /> Nouvelle discussion</Button></div>
            <div className="px-4 pb-4"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher dans l'historique..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-background" /></div></div>
            <div className="flex-1 overflow-y-auto px-3">
              {['today', 'yesterday', 'older'].map(key => {
                const items = grouped[key as keyof typeof grouped];
                if (!items?.length) return null;
                return (
                  <div key={key} className="mb-5">
                    <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{key === 'today' ? "Aujourd'hui" : key === 'yesterday' ? "Hier" : "Plus ancien"}</p>
                    {items.map(i => (
                      <div key={i.session_id} className={cn('group relative w-full flex items-center justify-between rounded-xl transition-all mb-1', activeSessionId === i.session_id ? 'bg-primary text-white shadow-md' : 'hover:bg-muted/80 text-foreground')}>
                        <button onClick={() => loadConversation(i)} className="flex-1 flex items-center gap-3 p-3 text-left overflow-hidden">
                          <MessageSquare className="h-4 w-4 shrink-0 opacity-80" />
                          <p className="truncate text-sm font-medium">{i.question_utilisateur}</p>
                        </button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-8 w-8 mr-1", activeSessionId === i.session_id ? "text-white hover:bg-white/20" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-muted")}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteChat(i.session_id)} className="text-red-500 font-medium cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer la discussion
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5 bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-muted"><MessageSquare className="h-5 w-5 text-primary" /></Button>
            <div><h2 className="font-bold text-lg">Tuteur IA</h2><p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Prêt à discuter</p></div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!activeSessionId}><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { if(activeSessionId) handleDeleteChat(activeSessionId); }} className="text-red-500 font-medium cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" /> Effacer cette discussion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/5">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center mt-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-lg mb-6">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground">Comment puis-je vous aider ?</h2>
                <p className="mt-3 max-w-md text-muted-foreground text-[15px] leading-relaxed">
                  Sélectionnez votre matière en bas et posez-moi n'importe quelle question. Je suis là pour vous expliquer les concepts et vous faire progresser.
                </p>
              </div>
            ) : (
              messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('group relative max-w-[85%] rounded-3xl p-5 shadow-sm', m.role === 'user' ? 'gradient-primary text-white rounded-br-sm' : 'bg-card border border-border/60 rounded-bl-sm')}>
                    
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{m.content}</div>
                    ) : (
                      <div className="text-foreground/90"><FormattedText content={m.content} /></div>
                    )}

                    {m.role === 'assistant' && (
                      <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium" onClick={() => copyMessage(m.content)}>
                          <Copy className="h-3.5 w-3.5" /> Copier
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ThumbsUp className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ThumbsDown className="h-3.5 w-3.5" /></Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {isTyping && <div className="flex justify-start"><div className="bg-card border border-border/60 shadow-sm rounded-3xl rounded-bl-sm p-5"><TypingIndicator /></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="border-t border-border/50 bg-card p-4 lg:p-5">
          <div className="mx-auto max-w-3xl flex gap-3 lg:gap-4">
            <div className="flex-1">
              {!activeCoursId && (
                <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="mb-2.5 w-auto min-w-[220px] rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs font-bold text-primary focus:outline-none uppercase tracking-wide">
                  {matieres.length === 0 ? <option value="">Chargement de vos matières...</option> : matieres.map(m => <option key={m.id ?? m.id_matiere} value={String(m.id ?? m.id_matiere)}>{m.name ?? m.nom_matiere}</option>)}
                </select>
              )}
              <Textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Tapez votre message ici..." className="min-h-[60px] resize-none border-border/60 focus-visible:ring-primary/40 text-[15px] p-4 shadow-inner rounded-xl" />
            </div>
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="gradient-primary text-white h-[60px] w-[60px] rounded-2xl shadow-md hover:shadow-lg transition-all self-end mb-[2px]">
              <Send className="h-5 w-5 ml-1" />
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Appuyez sur Entrée pour envoyer (Maj+Entrée pour un saut de ligne)</p>
        </div>
      </div>
    </div>
  );
}