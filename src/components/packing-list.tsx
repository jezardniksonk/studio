'use client';

import type { PackingItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PlusCircle, PackageCheck, ThumbsUp, PackageOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

interface PackingListProps {
  items: PackingItem[];
  onAddItem: (itemName: string) => void;
  onRemoveItem: (itemId: string) => void;
  onToggleItem: (itemId: string) => void;
  isLoading: boolean;
}

export function PackingList({ items, onAddItem, onRemoveItem, onToggleItem, isLoading }: PackingListProps) {
  const [newItemName, setNewItemName] = useState('');
  const [clientItems, setClientItems] = useState<PackingItem[]>([]);

  useEffect(() => {
    setClientItems(items);
  }, [items]);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
    }
  };
  
  const suggestedItems = clientItems.filter(item => item.isSuggestion);
  const customItems = clientItems.filter(item => !item.isSuggestion);

  return (
    <Card className="w-full shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <PackageCheck size={24} /> Your Packing List
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && clientItems.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center py-4">Generating smart suggestions...</p>
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2 p-2 border-b border-dashed">
                  <div className="animate-pulse bg-muted rounded-md h-5 w-5"></div>
                  <div className="animate-pulse bg-muted rounded h-5 flex-grow"></div>
                </div>
              ))}
          </div>
        )}

        {!isLoading && clientItems.length === 0 && (
           <div className="text-center py-8">
            <PackageOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your packing list is empty.</p>
            <p className="text-sm text-muted-foreground">Fill out the trip details to get started!</p>
          </div>
        )}

        {clientItems.length > 0 && (
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-3">
              {suggestedItems.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2">
                    <ThumbsUp size={16} />
                    AI Suggestions
                  </div>
                  {suggestedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-md border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.packed}
                          onCheckedChange={() => onToggleItem(item.id)}
                          aria-label={`Mark ${item.name} as ${item.packed ? 'unpacked' : 'packed'}`}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm cursor-pointer ${item.packed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.name}
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label={`Remove ${item.name}`}>
                        <X className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </>
              )}

              {suggestedItems.length > 0 && customItems.length > 0 && <Separator className="my-4" />}
              
              {customItems.length > 0 && (
                <>
                   <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2">
                    <PlusCircle size={16} />
                    Your Items
                  </div>
                  {customItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-md border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.packed}
                          onCheckedChange={() => onToggleItem(item.id)}
                          aria-label={`Mark ${item.name} as ${item.packed ? 'unpacked' : 'packed'}`}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm cursor-pointer ${item.packed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.name}
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label={`Remove ${item.name}`}>
                        <X className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="pt-6 border-t">
        <div className="flex w-full gap-2">
          <Input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add a custom item (e.g., My Book)"
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            disabled={isLoading}
            aria-label="New item name"
          />
          <Button onClick={handleAddItem} disabled={isLoading || !newItemName.trim()} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
