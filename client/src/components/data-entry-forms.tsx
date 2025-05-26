import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useDatabase } from '@/contexts/database-context';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, ShoppingCart, UtensilsCrossed, Package } from 'lucide-react';

// Schema para Restaurante
const restaurantSchema = z.object({
  rut: z.string().min(1, 'RUT es requerido'),
  nombre: z.string().min(1, 'Nombre es requerido')
});

// Schema para Empleado
const employeeSchema = z.object({
  cedula: z.string().min(1, 'Cédula es requerida'),
  nombres: z.string().min(1, 'Nombres son requeridos'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  idArea: z.string().min(1, 'Área es requerida'),
  idCargo: z.string().min(1, 'Cargo es requerido'),
  rutRestaurante: z.string().min(1, 'RUT del restaurante es requerido')
});

// Schema para Ingrediente
const ingredientSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  descripcion: z.string().optional(),
  cantidadStock: z.string().min(1, 'Cantidad es requerida'),
  unidadMedida: z.string().min(1, 'Unidad de medida es requerida'),
  fechaCaducidad: z.string().optional()
});

// Schema para Plato
const dishSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  descripcion: z.string().optional(),
  precio: z.string().min(1, 'Precio es requerido')
});

// Schema para Sede
const sedeSchema = z.object({
  nombre: z.string().min(1, 'Nombre de sede es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida')
});

// Schema para Area
const areaSchema = z.object({
  nombre: z.string().min(1, 'Nombre del área es requerido')
});

// Schema para Cargo
const cargoSchema = z.object({
  nombre: z.string().min(1, 'Nombre del cargo es requerido'),
  salario: z.string().min(1, 'Salario base es requerido')
});

// Schema para Mesa
const mesaSchema = z.object({
  idEspacio: z.string().min(1, 'Espacio es requerido'),
  numeroMesa: z.string().min(1, 'Número de mesa es requerido')
});

// Schema para Espacio
const espacioSchema = z.object({
  idSede: z.string().min(1, 'Sede es requerida'),
  capacidadMaxima: z.string().min(1, 'Capacidad máxima es requerida')
});

// Schema para Orden
const ordenSchema = z.object({
  idMesa: z.string().min(1, 'Mesa es requerida'),
  idEmpleado: z.string().min(1, 'Empleado es requerido'),
  fechaHora: z.string().min(1, 'Fecha y hora son requeridas')
});

// Schema para PQRS
const pqrsSchema = z.object({
  rutRestaurante: z.string().min(1, 'RUT del restaurante es requerido'),
  tipoSolicitud: z.string().min(1, 'Tipo de solicitud es requerido'),
  descripcion: z.string().min(1, 'Descripción es requerida'),
  fecha: z.string().min(1, 'Fecha es requerida')
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;
type EmployeeFormData = z.infer<typeof employeeSchema>;
type IngredientFormData = z.infer<typeof ingredientSchema>;
type DishFormData = z.infer<typeof dishSchema>;
type SedeFormData = z.infer<typeof sedeSchema>;
type AreaFormData = z.infer<typeof areaSchema>;
type CargoFormData = z.infer<typeof cargoSchema>;
type MesaFormData = z.infer<typeof mesaSchema>;
type EspacioFormData = z.infer<typeof espacioSchema>;
type OrdenFormData = z.infer<typeof ordenSchema>;
type PQRSFormData = z.infer<typeof pqrsSchema>;

// Opciones predefinidas
const areas = [
  { id: '1', name: 'Cocina' },
  { id: '2', name: 'Servicio' },
  { id: '3', name: 'Administración' },
  { id: '4', name: 'Caja' }
];

const cargos = [
  { id: '1', name: 'Chef' },
  { id: '2', name: 'Mesero' },
  { id: '3', name: 'Gerente' },
  { id: '4', name: 'Cajero' }
];

const unidadesMedida = [
  'Kilogramos', 'Gramos', 'Libras', 'Litros', 'Mililitros', 'Unidades', 'Paquetes'
];

const tiposSolicitud = [
  'Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación'
];

const sedes = [
  { id: '1', name: 'Sede Principal' },
  { id: '2', name: 'Sede Norte' },
  { id: '3', name: 'Sede Sur' }
];

const espacios = [
  { id: '1', name: 'Salón Principal' },
  { id: '2', name: 'Terraza' },
  { id: '3', name: 'Salón VIP' }
];

const mesas = [
  { id: '1', numero: '1' },
  { id: '2', numero: '2' },
  { id: '3', numero: '3' },
  { id: '4', numero: '4' },
  { id: '5', numero: '5' }
];

const empleados = [
  { id: 'EMP001', nombre: 'Juan Pérez' },
  { id: 'EMP002', nombre: 'María López' },
  { id: 'EMP003', nombre: 'Carlos García' }
];

export default function DataEntryForms() {
  const { executeQuery } = useDatabase();
  const { toast } = useToast();

  // Formulario de Restaurante
  const RestaurantForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<RestaurantFormData>({
      resolver: zodResolver(restaurantSchema)
    });

    const onSubmit = async (data: RestaurantFormData) => {
      try {
        const query = `INSERT INTO Restaurante (RUT, Nombre) VALUES ('${data.rut}', '${data.nombre}')`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Restaurante creado correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear el restaurante",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nuevo Restaurante
          </CardTitle>
          <CardDescription>Registrar un nuevo restaurante en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut">RUT del Restaurante</Label>
              <Input
                id="rut"
                {...register('rut')}
                placeholder="Ej: 12345678-9"
              />
              {errors.rut && (
                <p className="text-sm text-destructive">{errors.rut.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Restaurante</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Restaurante El Sabor"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Restaurante
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Empleado
  const EmployeeForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EmployeeFormData>({
      resolver: zodResolver(employeeSchema)
    });

    const onSubmit = async (data: EmployeeFormData) => {
      try {
        const query = `
          INSERT INTO Empleado (Cedula, RUT, ID_Sede, ID_Cargo, ID_Area, Nombres, Numero_Contacto, Correo_Corporativo)
          VALUES ('${data.cedula}', '${data.rutRestaurante}', 1, ${data.idCargo}, ${data.idArea}, '${data.nombres}', '${data.telefono || ''}', '${data.email || ''}')
        `;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Empleado registrado correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al registrar el empleado",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nuevo Empleado
          </CardTitle>
          <CardDescription>Registrar un nuevo empleado en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  {...register('cedula')}
                  placeholder="Ej: 12345678"
                />
                {errors.cedula && (
                  <p className="text-sm text-destructive">{errors.cedula.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rutRestaurante">RUT Restaurante</Label>
                <Input
                  id="rutRestaurante"
                  {...register('rutRestaurante')}
                  placeholder="Ej: 12345678-9"
                />
                {errors.rutRestaurante && (
                  <p className="text-sm text-destructive">{errors.rutRestaurante.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres Completos</Label>
              <Input
                id="nombres"
                {...register('nombres')}
                placeholder="Ej: Juan Carlos Pérez González"
              />
              {errors.nombres && (
                <p className="text-sm text-destructive">{errors.nombres.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register('telefono')}
                  placeholder="Ej: +57 300 123 4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Ej: juan.perez@restaurante.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área</Label>
                <Select onValueChange={(value) => setValue('idArea', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idArea && (
                  <p className="text-sm text-destructive">{errors.idArea.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select onValueChange={(value) => setValue('idCargo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id}>
                        {cargo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idCargo && (
                  <p className="text-sm text-destructive">{errors.idCargo.message}</p>
                )}
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Registrar Empleado
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Ingrediente
  const IngredientForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<IngredientFormData>({
      resolver: zodResolver(ingredientSchema)
    });

    const onSubmit = async (data: IngredientFormData) => {
      try {
        const query = `
          INSERT INTO Materias_Primas (ID_Inventario_MP, Nombre_Ingrediente, Descripcion, Fecha_Caducidad, Cantidad_Stock, Unidad_Medida)
          VALUES (1, '${data.nombre}', '${data.descripcion || ''}', ${data.fechaCaducidad ? `'${data.fechaCaducidad}'` : 'NULL'}, ${data.cantidadStock}, '${data.unidadMedida}')
        `;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Ingrediente agregado correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al agregar el ingrediente",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nuevo Ingrediente
          </CardTitle>
          <CardDescription>Agregar un nuevo ingrediente al inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Ingrediente</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Tomate"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Descripción del ingrediente"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidadStock">Cantidad en Stock</Label>
                <Input
                  id="cantidadStock"
                  type="number"
                  step="0.01"
                  {...register('cantidadStock')}
                  placeholder="Ej: 10.5"
                />
                {errors.cantidadStock && (
                  <p className="text-sm text-destructive">{errors.cantidadStock.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Unidad de Medida</Label>
                <Select onValueChange={(value) => setValue('unidadMedida', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidadMedida && (
                  <p className="text-sm text-destructive">{errors.unidadMedida.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaCaducidad">Fecha de Caducidad (Opcional)</Label>
              <Input
                id="fechaCaducidad"
                type="date"
                {...register('fechaCaducidad')}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Agregar Ingrediente
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Plato
  const DishForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<DishFormData>({
      resolver: zodResolver(dishSchema)
    });

    const onSubmit = async (data: DishFormData) => {
      try {
        const query = `
          INSERT INTO Plato (Nombre_Plato, Descripcion, Precio)
          VALUES ('${data.nombre}', '${data.descripcion || ''}', ${data.precio})
        `;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Plato agregado correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al agregar el plato",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Nuevo Plato
          </CardTitle>
          <CardDescription>Agregar un nuevo plato al menú</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Plato</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Pasta Carbonara"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Descripción del plato"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                {...register('precio')}
                placeholder="Ej: 25000"
              />
              {errors.precio && (
                <p className="text-sm text-destructive">{errors.precio.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Agregar Plato
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Sede
  const SedeForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<SedeFormData>({
      resolver: zodResolver(sedeSchema)
    });

    const onSubmit = async (data: SedeFormData) => {
      try {
        const query = `INSERT INTO Sede (Nombre_Sede, Direccion) VALUES ('${data.nombre}', '${data.direccion}')`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Sede creada correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear la sede",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nueva Sede
          </CardTitle>
          <CardDescription>Registrar una nueva sede del restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Sede</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Sede Centro"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                {...register('direccion')}
                placeholder="Ej: Calle 123 #45-67"
              />
              {errors.direccion && (
                <p className="text-sm text-destructive">{errors.direccion.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Sede
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Área
  const AreaForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AreaFormData>({
      resolver: zodResolver(areaSchema)
    });

    const onSubmit = async (data: AreaFormData) => {
      try {
        const query = `INSERT INTO Area (Nombre_Area) VALUES ('${data.nombre}')`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Área creada correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear el área",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Nueva Área</CardTitle>
          <CardDescription>Registrar una nueva área de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Área</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Cocina"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Área
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Cargo
  const CargoForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CargoFormData>({
      resolver: zodResolver(cargoSchema)
    });

    const onSubmit = async (data: CargoFormData) => {
      try {
        const query = `INSERT INTO Cargo (Nombre_Cargo, Salario_Base) VALUES ('${data.nombre}', ${data.salario})`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Cargo creado correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear el cargo",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Cargo</CardTitle>
          <CardDescription>Registrar un nuevo cargo en la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Cargo</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Chef Principal"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salario">Salario Base</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                {...register('salario')}
                placeholder="Ej: 1500000"
              />
              {errors.salario && (
                <p className="text-sm text-destructive">{errors.salario.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Cargo
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Mesa
  const MesaForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MesaFormData>({
      resolver: zodResolver(mesaSchema)
    });

    const onSubmit = async (data: MesaFormData) => {
      try {
        const query = `INSERT INTO Mesa (ID_Espacio, Numero_Mesa) VALUES (${data.idEspacio}, ${data.numeroMesa})`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Mesa creada correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear la mesa",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Nueva Mesa</CardTitle>
          <CardDescription>Registrar una nueva mesa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Espacio</Label>
              <Select onValueChange={(value) => setValue('idEspacio', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar espacio" />
                </SelectTrigger>
                <SelectContent>
                  {espacios.map((espacio) => (
                    <SelectItem key={espacio.id} value={espacio.id}>
                      {espacio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idEspacio && (
                <p className="text-sm text-destructive">{errors.idEspacio.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numeroMesa">Número de Mesa</Label>
              <Input
                id="numeroMesa"
                type="number"
                {...register('numeroMesa')}
                placeholder="Ej: 5"
              />
              {errors.numeroMesa && (
                <p className="text-sm text-destructive">{errors.numeroMesa.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Mesa
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de Orden
  const OrdenForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<OrdenFormData>({
      resolver: zodResolver(ordenSchema)
    });

    const onSubmit = async (data: OrdenFormData) => {
      try {
        const query = `INSERT INTO Orden (ID_Mesa, ID_Empleado, Fecha_Hora) VALUES (${data.idMesa}, '${data.idEmpleado}', '${data.fechaHora}')`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "Orden creada correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear la orden",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nueva Orden
          </CardTitle>
          <CardDescription>Registrar una nueva orden</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mesa</Label>
                <Select onValueChange={(value) => setValue('idMesa', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesas.map((mesa) => (
                      <SelectItem key={mesa.id} value={mesa.id}>
                        Mesa {mesa.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idMesa && (
                  <p className="text-sm text-destructive">{errors.idMesa.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select onValueChange={(value) => setValue('idEmpleado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleados.map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.id}>
                        {empleado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idEmpleado && (
                  <p className="text-sm text-destructive">{errors.idEmpleado.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaHora">Fecha y Hora</Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                {...register('fechaHora')}
              />
              {errors.fechaHora && (
                <p className="text-sm text-destructive">{errors.fechaHora.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Crear Orden
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Formulario de PQRS
  const PQRSForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PQRSFormData>({
      resolver: zodResolver(pqrsSchema)
    });

    const onSubmit = async (data: PQRSFormData) => {
      try {
        const query = `INSERT INTO PQRS (RUT, Tipo_Solicitud, Descripcion, Fecha) VALUES ('${data.rutRestaurante}', '${data.tipoSolicitud}', '${data.descripcion}', '${data.fecha}')`;
        await executeQuery(query);
        toast({
          title: "¡Éxito!",
          description: "PQRS registrada correctamente",
        });
        reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al registrar la PQRS",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Nueva PQRS</CardTitle>
          <CardDescription>Registrar una petición, queja, reclamo o sugerencia</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rutRestaurante">RUT del Restaurante</Label>
              <Input
                id="rutRestaurante"
                {...register('rutRestaurante')}
                placeholder="Ej: 12345678-9"
              />
              {errors.rutRestaurante && (
                <p className="text-sm text-destructive">{errors.rutRestaurante.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Solicitud</Label>
              <Select onValueChange={(value) => setValue('tipoSolicitud', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposSolicitud.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoSolicitud && (
                <p className="text-sm text-destructive">{errors.tipoSolicitud.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Describa detalladamente su solicitud"
                rows={4}
              />
              {errors.descripcion && (
                <p className="text-sm text-destructive">{errors.descripcion.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                {...register('fecha')}
              />
              {errors.fecha && (
                <p className="text-sm text-destructive">{errors.fecha.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Registrar PQRS
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Formularios de Ingreso de Datos</h2>
        <p className="text-muted-foreground">Utiliza estos formularios para agregar información al sistema de manera fácil e intuitiva</p>
      </div>
      
      <Tabs defaultValue="restaurante" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="restaurante">Restaurante</TabsTrigger>
          <TabsTrigger value="sedes">Sedes</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="cargos">Cargos</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="platos">Platos</TabsTrigger>
          <TabsTrigger value="mesas">Mesas</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <Tabs defaultValue="ordenes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
              <TabsTrigger value="pqrs">PQRS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ordenes" className="mt-6">
              <OrdenForm />
            </TabsContent>
            
            <TabsContent value="pqrs" className="mt-6">
              <PQRSForm />
            </TabsContent>
          </Tabs>
        </div>
        
        <TabsContent value="restaurante" className="mt-6">
          <RestaurantForm />
        </TabsContent>
        
        <TabsContent value="sedes" className="mt-6">
          <SedeForm />
        </TabsContent>
        
        <TabsContent value="areas" className="mt-6">
          <AreaForm />
        </TabsContent>
        
        <TabsContent value="cargos" className="mt-6">
          <CargoForm />
        </TabsContent>
        
        <TabsContent value="empleados" className="mt-6">
          <EmployeeForm />
        </TabsContent>
        
        <TabsContent value="ingredientes" className="mt-6">
          <IngredientForm />
        </TabsContent>
        
        <TabsContent value="platos" className="mt-6">
          <DishForm />
        </TabsContent>
        
        <TabsContent value="mesas" className="mt-6">
          <MesaForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}