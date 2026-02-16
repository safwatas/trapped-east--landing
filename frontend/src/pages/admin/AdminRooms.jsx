import React, { useState, useEffect } from 'react';
import { Save, Loader2, Languages, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setRooms(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleExpand = (roomId) => {
    if (expandedRoom === roomId) {
      setExpandedRoom(null);
      setEditingRoom(null);
    } else {
      setExpandedRoom(roomId);
      const room = rooms.find(r => r.id === roomId);
      setEditingRoom({ ...room });
    }
  };

  const handleInputChange = (field, value) => {
    setEditingRoom(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingRoom) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: editingRoom.name,
          name_ar: editingRoom.name_ar,
          tagline: editingRoom.tagline,
          tagline_ar: editingRoom.tagline_ar,
          description: editingRoom.description,
          description_ar: editingRoom.description_ar,
        })
        .eq('id', editingRoom.id);

      if (error) throw error;

      // Update local state
      setRooms(prev => prev.map(r =>
        r.id === editingRoom.id ? { ...r, ...editingRoom } : r
      ));

      toast.success('Room updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update room');
    } finally {
      setIsSaving(false);
    }
  };

  const hasArabicTranslation = (room) => {
    return room.name_ar && room.tagline_ar && room.description_ar;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-[color:var(--brand-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Rooms</h1>
        <p className="text-[color:var(--text-muted)] mt-1">
          Manage room details and translations
        </p>
      </div>

      {/* Translation Status Overview */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Translation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-black/20">
              <p className="font-display text-2xl font-bold text-white">
                {rooms.length}
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">Total Rooms</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-500/10">
              <p className="font-display text-2xl font-bold text-green-400">
                {rooms.filter(hasArabicTranslation).length}
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">Fully Translated</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-500/10">
              <p className="font-display text-2xl font-bold text-orange-400">
                {rooms.filter(r => (r.name_ar || r.description_ar) && !hasArabicTranslation(r)).length}
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">Partial</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/10">
              <p className="font-display text-2xl font-bold text-red-400">
                {rooms.filter(r => !r.name_ar && !r.description_ar).length}
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">No Arabic</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`bg-[color:var(--bg-surface)] border-white/10 transition-all ${expandedRoom === room.id ? 'ring-1 ring-[color:var(--brand-accent)]' : ''
              }`}
          >
            <CardHeader
              className="cursor-pointer hover:bg-white/5 rounded-t-lg transition-colors"
              onClick={() => handleExpand(room.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-white">{room.name}</CardTitle>
                  {hasArabicTranslation(room) ? (
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                      <Check className="w-3 h-3" />
                      Arabic Ready
                    </span>
                  ) : room.name_ar || room.description_ar ? (
                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                      Partial
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      <X className="w-3 h-3" />
                      No Arabic
                    </span>
                  )}
                </div>
                {expandedRoom === room.id ? (
                  <ChevronUp className="w-5 h-5 text-[color:var(--text-muted)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[color:var(--text-muted)]" />
                )}
              </div>
            </CardHeader>

            {expandedRoom === room.id && editingRoom && (
              <CardContent className="space-y-6 border-t border-white/10 pt-6">
                {/* Name Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Name (English)</Label>
                    <Input
                      value={editingRoom.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Name (Arabic)</Label>
                    <Input
                      value={editingRoom.name_ar || ''}
                      onChange={(e) => handleInputChange('name_ar', e.target.value)}
                      className="bg-black/30 border-white/10 text-white text-right"
                      dir="rtl"
                      placeholder="اسم الغرفة بالعربية"
                    />
                  </div>
                </div>

                {/* Tagline Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Tagline (English)</Label>
                    <Input
                      value={editingRoom.tagline || ''}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Tagline (Arabic)</Label>
                    <Input
                      value={editingRoom.tagline_ar || ''}
                      onChange={(e) => handleInputChange('tagline_ar', e.target.value)}
                      className="bg-black/30 border-white/10 text-white text-right"
                      dir="rtl"
                      placeholder="الشعار بالعربية"
                    />
                  </div>
                </div>

                {/* Description Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Description (English)</Label>
                    <Textarea
                      value={editingRoom.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="bg-black/30 border-white/10 text-white min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[color:var(--text-muted)]">Description (Arabic)</Label>
                    <Textarea
                      value={editingRoom.description_ar || ''}
                      onChange={(e) => handleInputChange('description_ar', e.target.value)}
                      className="bg-black/30 border-white/10 text-white min-h-[120px] text-right"
                      dir="rtl"
                      placeholder="وصف الغرفة بالعربية..."
                    />
                  </div>
                </div>

                {/* Room Info (Read-only) */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                  <h4 className="text-sm font-medium text-white mb-3">Room Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[color:var(--text-muted)]">Slug:</span>
                      <span className="text-white ml-2 font-mono">{room.slug}</span>
                    </div>
                    <div>
                      <span className="text-[color:var(--text-muted)]">Difficulty:</span>
                      <span className="text-white ml-2">{room.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[color:var(--text-muted)]">Players:</span>
                      <span className="text-white ml-2">{room.min_players}-{room.max_players}</span>
                    </div>
                    <div>
                      <span className="text-[color:var(--text-muted)]">Duration:</span>
                      <span className="text-white ml-2">{room.duration} min</span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
