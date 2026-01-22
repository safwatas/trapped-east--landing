import React, { useState } from 'react';
import { Edit, Save, X, Users, Clock, Puzzle, Skull } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { rooms as initialRooms } from '../../data/mock';
import { toast } from 'sonner';

export default function AdminRooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (room) => {
    setEditingRoom({ ...room });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setRooms(prev => prev.map(r => 
      r.id === editingRoom.id ? editingRoom : r
    ));
    toast.success('Room updated successfully');
    setIsDialogOpen(false);
    setEditingRoom(null);
  };

  const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Rooms</h1>
        <p className="text-[color:var(--text-muted)] mt-1">Manage escape room details</p>
      </div>

      {/* Rooms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-[color:var(--bg-surface)] border-white/10 overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-display text-lg font-bold text-white">{room.name}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/10 border-white/20 text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {room.minPlayers}-{room.maxPlayers}
                </Badge>
                <Badge className="bg-white/10 border-white/20 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {room.duration}min
                </Badge>
                <Badge className="bg-white/10 border-white/20 text-white">
                  <Puzzle className="w-3 h-3 mr-1" />
                  {room.difficulty}
                </Badge>
                {room.isHorror && (
                  <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                    <Skull className="w-3 h-3 mr-1" />
                    Horror
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[color:var(--text-muted)] line-clamp-2">
                {room.description}
              </p>
              <Button 
                onClick={() => handleEdit(room)}
                variant="outline" 
                className="w-full border-white/15 text-white hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Room
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Room</DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Name</Label>
                <Input
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tagline</Label>
                <Input
                  value={editingRoom.tagline}
                  onChange={(e) => setEditingRoom({ ...editingRoom, tagline: e.target.value })}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={editingRoom.description}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="bg-black/30 border-white/10 text-white"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Min Players</Label>
                  <Input
                    type="number"
                    value={editingRoom.minPlayers}
                    onChange={(e) => setEditingRoom({ ...editingRoom, minPlayers: parseInt(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Max Players</Label>
                  <Input
                    type="number"
                    value={editingRoom.maxPlayers}
                    onChange={(e) => setEditingRoom({ ...editingRoom, maxPlayers: parseInt(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Duration (min)</Label>
                  <Input
                    type="number"
                    value={editingRoom.duration}
                    onChange={(e) => setEditingRoom({ ...editingRoom, duration: parseInt(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Difficulty</Label>
                  <Select 
                    value={editingRoom.difficulty} 
                    onValueChange={(value) => setEditingRoom({ ...editingRoom, difficulty: value })}
                  >
                    <SelectTrigger className="bg-black/30 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[color:var(--bg-elevated)] border-white/10">
                      {difficultyOptions.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-white">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10">
                <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Horror Room</p>
                    <p className="text-xs text-[color:var(--text-muted)]">This room has horror elements</p>
                  </div>
                </div>
                <Switch
                  checked={editingRoom.isHorror}
                  onCheckedChange={(checked) => setEditingRoom({ ...editingRoom, isHorror: checked })}
                />
              </div>

              {editingRoom.isHorror && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10">
                  <div>
                    <p className="text-white font-medium">Horror Toggleable</p>
                    <p className="text-xs text-[color:var(--text-muted)]">Customers can disable horror</p>
                  </div>
                  <Switch
                    checked={editingRoom.horrorToggleable}
                    onCheckedChange={(checked) => setEditingRoom({ ...editingRoom, horrorToggleable: checked })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white">Image URL</Label>
                <Input
                  value={editingRoom.image}
                  onChange={(e) => setEditingRoom({ ...editingRoom, image: e.target.value })}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/15 text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
