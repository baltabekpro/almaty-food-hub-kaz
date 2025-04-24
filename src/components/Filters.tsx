
import React from 'react';
import { Button } from "@/components/ui/button";

interface FiltersProps {
  cuisines: string[];
  selectedCuisine: string | null;
  onCuisineSelect: (cuisine: string | null) => void;
}

const Filters = ({ cuisines, selectedCuisine, onCuisineSelect }: FiltersProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCuisine === null ? "default" : "outline"}
        onClick={() => onCuisineSelect(null)}
        className="whitespace-nowrap"
      >
        Все
      </Button>
      {cuisines.map((cuisine) => (
        <Button
          key={cuisine}
          variant={selectedCuisine === cuisine ? "default" : "outline"}
          onClick={() => onCuisineSelect(cuisine)}
          className="whitespace-nowrap"
        >
          {cuisine}
        </Button>
      ))}
    </div>
  );
};

export default Filters;
