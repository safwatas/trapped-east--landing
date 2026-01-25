import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { bookingService } from '../../lib/bookingService';
import { toast } from 'sonner';

export default function AdminPricing() {
  const [pricing, setPricing] = useState({ 2: 470, 3: 460, 4: 450, 5: 440, 6: 430, 7: 420, default: 420 });
  const [promoCodes, setPromoCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPromo, setNewPromo] = useState({ code: '', discount_value: '', discount_type: 'percentage' });

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getAllPromoCodes();
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load promo codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handlePriceChange = (players, value) => {
    setPricing(prev => ({ ...prev, [players]: parseInt(value) || 0 }));
  };

  const handleSavePricing = () => {
    toast.success('Pricing updated successfully (UI simulation for now)');
  };

  const handleAddPromo = async () => {
    if (!newPromo.code || !newPromo.discount_value) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const dbPromo = {
        code: newPromo.code,
        discount_value: parseInt(newPromo.discount_value),
        discount_type: newPromo.discount_type,
        active: true
      };
      await bookingService.upsertPromoCode(dbPromo);
      toast.success('Promo code added');
      setNewPromo({ code: '', discount_value: '', discount_type: 'percentage' });
      fetchPromos();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add promo code");
    }
  };

  const handleTogglePromo = async (promo) => {
    try {
      await bookingService.upsertPromoCode({ ...promo, active: !promo.active });
      setPromoCodes(prev => prev.map(p =>
        p.id === promo.id ? { ...p, active: !promo.active } : p
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update promo");
    }
  };

  const handleDeletePromo = async (id) => {
    try {
      await bookingService.deletePromoCode(id);
      setPromoCodes(prev => prev.filter(p => p.id !== id));
      toast.success('Promo code deleted');
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete promo code");
    }
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
                  value={newPromo.discount_value}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })}
                  placeholder="20"
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[color:var(--text-muted)]">Type</Label>
                <select
                  value={newPromo.discount_type}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })}
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
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 text-[color:var(--brand-accent)] animate-spin" />
              </div>
            ) : (
              promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${promo.active
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-black/20 border-white/10 opacity-60'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono font-bold text-white">{promo.code}</p>
                      <p className="text-sm text-[color:var(--text-muted)]">
                        {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' EGP'} off
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePromo(promo)}
                      className={promo.active ? 'text-green-400' : 'text-[color:var(--text-muted)]'}
                    >
                      {promo.active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePromo(promo.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
