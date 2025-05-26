import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDatabase } from '@/contexts/database-context';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed, Search, Package, DollarSign } from 'lucide-react';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  ingredients?: Ingredient[];
}

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export default function MenuDisplay() {
  const { executeQuery, isConnected } = useDatabase();
  const { toast } = useToast();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDishes = async () => {
    if (!isConnected) {
      toast({
        title: "Sin conexión",
        description: "Conecta a la base de datos para ver los platos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dishQuery = `
        SELECT 
          p.ID_Plato as id,
          p.Nombre_Plato as name,
          p.Descripcion as description,
          p.Precio as price
        FROM Plato p
        ORDER BY p.Nombre_Plato
      `;
      
      const result = await executeQuery(dishQuery);
      if (result) {
        setDishes(result.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description || 'Sin descripción',
          price: parseFloat(row.price) || 0
        })));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los platos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIngredients = async (dishId: number): Promise<Ingredient[]> => {
    try {
      const ingredientQuery = `
        SELECT 
          mp.ID_Ingrediente as id,
          mp.Nombre_Ingrediente as name,
          pi.Cantidad_Usada as quantity,
          mp.Unidad_Medida as unit
        FROM Plato_Ingrediente pi
        JOIN Materias_Primas mp ON pi.ID_Ingrediente = mp.ID_Ingrediente
        WHERE pi.ID_Plato = ${dishId}
      `;
      
      const result = await executeQuery(ingredientQuery);
      if (result) {
        return result.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          quantity: parseFloat(row.quantity) || 0,
          unit: row.unit || ''
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    loadDishes();
  }, [isConnected]);

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const DishCard = ({ dish }: { dish: Dish }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [showIngredients, setShowIngredients] = useState(false);
    const [loadingIngredients, setLoadingIngredients] = useState(false);

    const handleShowIngredients = async () => {
      if (!showIngredients && ingredients.length === 0) {
        setLoadingIngredients(true);
        const dishIngredients = await loadIngredients(dish.id);
        setIngredients(dishIngredients);
        setLoadingIngredients(false);
      }
      setShowIngredients(!showIngredients);
    };

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              {dish.name}
            </span>
            <Badge variant="secondary" className="text-lg font-bold">
              {formatPrice(dish.price)}
            </Badge>
          </CardTitle>
          <CardDescription>{dish.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Precio: {formatPrice(dish.price)}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShowIngredients}
              disabled={loadingIngredients}
              className="w-full"
            >
              <Package className="h-4 w-4 mr-2" />
              {loadingIngredients ? 'Cargando...' : showIngredients ? 'Ocultar Ingredientes' : 'Ver Ingredientes'}
            </Button>
            
            {showIngredients && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Ingredientes:</h4>
                {ingredients.length > 0 ? (
                  <div className="grid gap-2">
                    {ingredients.map((ingredient) => (
                      <div 
                        key={ingredient.id} 
                        className="flex justify-between items-center p-2 bg-muted rounded text-sm"
                      >
                        <span>{ingredient.name}</span>
                        <span className="text-muted-foreground">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay ingredientes registrados para este plato
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Menú del Restaurante</h2>
        <p className="text-muted-foreground">
          Explora nuestros platos, precios e ingredientes
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Botón para recargar */}
      <div className="mb-6">
        <Button onClick={loadDishes} disabled={loading || !isConnected}>
          {loading ? 'Cargando...' : 'Recargar Menú'}
        </Button>
      </div>

      {/* Grid de platos */}
      {!isConnected ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Conecta a la base de datos para ver el menú del restaurante
            </p>
          </CardContent>
        </Card>
      ) : filteredDishes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {dishes.length === 0 ? 'No hay platos registrados' : 'No se encontraron platos con ese término de búsqueda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}