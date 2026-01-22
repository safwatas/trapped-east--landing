import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { pricing as initialPricing } from '../../data/mock';
import { toast } from 'sonner';

export default function AdminPricing() {
  const [pricing, setPricing] = useState(initialPricing);
  const [promoCodes, setPromoCodes] = useState([
    { code: 'SUMMER20', discount: 20, type: 'percentage', active: true },
    { code: 'FIRST50', discount: 50, type: 'fixed', active: true }
  ]);
  const [newPromo, setNewPromo] = useState({ code: '', discount: '', type: 'percentage' });

  const handlePriceChange = (players, value) => {
    setPricing(prev => ({ ...prev, [players]: parseInt(value) || 0 }));
  };

  const handleSavePricing = () => {
    toast.success('Pricing updated successfully');
  };

  const handleAddPromo = () => {
    if (!newPromo.code || !newPromo.discount) {
      toast.error('Please fill in all fields');
      return;
    }
    setPromoCodes(prev => [...prev, { ...newPromo, discount: parseInt(newPromo.discount), active: true }]);
    setNewPromo({ code: '', discount: '', type: 'percentage' });
    toast.success('Promo code added');
  };

  const handleTogglePromo = (code) => {
    setPromoCodes(prev => prev.map(p => 
      p.code === code ? { ...p, active: !p.active } : p
    ));
  };

  const handleDeletePromo = (code) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    toast.success('Promo code deleted');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Pricing</h1>
        <p className="text-[color:var(--text-muted)] mt-1">Manage pricing tiers and promo codes</p>
      </div>

      {/* Pricing Tiers */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Price per Person (EGP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[2, 3, 4, 5, 6, 7].map((players) => (
              <div key={players} className="space-y-2">
                <Label className="text-[color:var(--text-muted)]">{players} Players</Label>
                <Input
                  type="number"
                  value={pricing[players]}
                  onChange={(e) => handlePriceChange(players, e.target.value)}
                  className="bg-black/30 border-white/10 text-white text-center"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-[color:var(--text-muted)]">7+ Players</Label>
              <Input
                type="number"
                value={pricing.default}
                onChange={(e) => handlePriceChange('default', e.target.value)}
                className="bg-black/30 border-white/10 text-white text-center"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button onClick={handleSavePricing} className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
              <Save className="w-4 h-4 mr-2" />
              Save Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Preview */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pricing Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[color:var(--text-muted)]">Players</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[color:var(--text-muted)]">Per Person</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[color:var(--text-muted)]">Total</th>
                </tr>
              </thead>
              <tbody>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((players) => {
                  const pricePerPerson = players <= 7 ? pricing[players] : pricing.default;
                  const total = pricePerPerson * players;
                  return (
                    <tr key={players} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white">{players} players</td>
                      <td className="py-3 px-4 text-right text-[color:var(--text-secondary)]">{pricePerPerson} EGP</td>
                      <td className="py-3 px-4 text-right font-display font-semibold text-[color:var(--brand-accent)]">{total} EGP</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes */}
      <Card className="bg-[color:var(--bg-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Promo Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Promo */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <h4 className="text-sm font-medium text-white mb-4">Add New Promo Code</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-[color:var(--text-muted)]">Code</Label>
                <Input
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[color:var(--text-muted)]">Discount</Label>
                <Input
                  type="number"
                  value={newPromo.discount}
                  onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                  placeholder="20"
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[color:var(--text-muted)]">Type</Label>
                <select
                  value={newPromo.type}
                  onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-black/30 border border-white/10 text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (EGP)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddPromo} className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Promos */}
          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div 
                key={promo.code}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  promo.active 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-black/20 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono font-bold text-white">{promo.code}</p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {promo.discount}{promo.type === 'percentage' ? '%' : ' EGP'} off
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePromo(promo.code)}
                    className={promo.active ? 'text-green-400' : 'text-[color:var(--text-muted)]'}
                  >
                    {promo.active ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePromo(promo.code)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
