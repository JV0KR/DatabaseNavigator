import React, { useState } from 'react';
import { Database, UtensilsCrossed, Users, ShoppingBasket, BarChart, Calendar } from 'lucide-react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import QueryEditor from '@/components/database/query-editor';
import QueryResults from '@/components/database/query-results';
import ConnectionModal from '@/components/database/connection-modal';
import DataEntryForms from '@/components/data-entry-forms';
import MenuDisplay from '@/components/menu-display';
import { useDatabase } from '@/contexts/database-context';
import { Connection } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Restaurant SQL templates
const RESTAURANT_TEMPLATES = {
  createRestaurantSchema: `-- Drop tables in reverse order of dependencies to avoid foreign key constraint errors
IF OBJECT_ID('PQRS', 'U') IS NOT NULL DROP TABLE PQRS;
IF OBJECT_ID('Factura', 'U') IS NOT NULL DROP TABLE Factura;
IF OBJECT_ID('Detalle_Orden', 'U') IS NOT NULL DROP TABLE Detalle_Orden;
IF OBJECT_ID('Orden', 'U') IS NOT NULL DROP TABLE Orden;
IF OBJECT_ID('Plato_Ingrediente', 'U') IS NOT NULL DROP TABLE Plato_Ingrediente;
IF OBJECT_ID('Mesa', 'U') IS NOT NULL DROP TABLE Mesa;
IF OBJECT_ID('Espacio', 'U') IS NOT NULL DROP TABLE Espacio;
IF OBJECT_ID('Plato', 'U') IS NOT NULL DROP TABLE Plato;
IF OBJECT_ID('Materias_Primas', 'U') IS NOT NULL DROP TABLE Materias_Primas;
IF OBJECT_ID('Inventario_Materias_Primas', 'U') IS NOT NULL DROP TABLE Inventario_Materias_Primas;
IF OBJECT_ID('Nomina', 'U') IS NOT NULL DROP TABLE Nomina;
IF OBJECT_ID('Horario', 'U') IS NOT NULL DROP TABLE Horario;
IF OBJECT_ID('Empleado', 'U') IS NOT NULL DROP TABLE Empleado;
IF OBJECT_ID('Cargo', 'U') IS NOT NULL DROP TABLE Cargo;
IF OBJECT_ID('Area', 'U') IS NOT NULL DROP TABLE Area;
IF OBJECT_ID('Sede', 'U') IS NOT NULL DROP TABLE Sede;
IF OBJECT_ID('Restaurante', 'U') IS NOT NULL DROP TABLE Restaurante;

-- Create Restaurante table
CREATE TABLE Restaurante (
    RUT VARCHAR(20) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
);

-- Create Sede table
CREATE TABLE Sede (
    ID_Sede INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Sede VARCHAR(50) NOT NULL,
    Direccion VARCHAR(255)
);

-- Create Area table
CREATE TABLE Area (
    ID_Area INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Area VARCHAR(50) NOT NULL
);

-- Create Cargo table
CREATE TABLE Cargo (
    ID_Cargo INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Cargo VARCHAR(50) NOT NULL,
    Salario_Base DECIMAL(12, 2) NOT NULL
);

-- Create Empleado table con Cedula como VARCHAR
CREATE TABLE Empleado (
    Cedula VARCHAR(20) PRIMARY KEY, -- Cambiado a VARCHAR para cédulas que pueden contener caracteres no numéricos
    RUT VARCHAR(20) NOT NULL,
    ID_Sede INT NOT NULL,
    ID_Cargo INT NOT NULL,
    ID_Area INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Numero_Contacto VARCHAR(20),
    Correo_Corporativo VARCHAR(100),
    CONSTRAINT FK_Empleado_Restaurante FOREIGN KEY (RUT) REFERENCES Restaurante(RUT),
    CONSTRAINT FK_Empleado_Sede FOREIGN KEY (ID_Sede) REFERENCES Sede(ID_Sede),
    CONSTRAINT FK_Empleado_Cargo FOREIGN KEY (ID_Cargo) REFERENCES Cargo(ID_Cargo),
    CONSTRAINT FK_Empleado_Area FOREIGN KEY (ID_Area) REFERENCES Area(ID_Area)
);

-- Create Horario table con ID_Empleado como VARCHAR
CREATE TABLE Horario (
    ID_Horario INT IDENTITY(1,1) PRIMARY KEY,
    ID_Empleado VARCHAR(20) NOT NULL, -- Cambiado a VARCHAR para coincidir con Empleado(Cedula)
    Dia_Semana VARCHAR(15),
    Hora_Inicio TIME,
    Hora_Fin TIME,
    CONSTRAINT FK_Horario_Empleado FOREIGN KEY (ID_Empleado) REFERENCES Empleado(Cedula)
);

-- Create Nomina table con Cedula como VARCHAR
CREATE TABLE Nomina (
    ID_Nomina INT IDENTITY(1,1) PRIMARY KEY,
    Cedula VARCHAR(20) NOT NULL, -- Cambiado a VARCHAR para coincidir con Empleado(Cedula)
    Fecha_Pago DATE NOT NULL,
    Horas_Trabajadas DECIMAL(5, 2),
    Bonificaciones DECIMAL(12, 2),
    CONSTRAINT FK_Nomina_Empleado FOREIGN KEY (Cedula) REFERENCES Empleado(Cedula)
);

-- Create Inventario_Materias_Primas table
CREATE TABLE Inventario_Materias_Primas (
    ID_Inventario_MP INT IDENTITY(1,1) PRIMARY KEY,
    RUT VARCHAR(20) NOT NULL,
    CONSTRAINT FK_Inventario_Restaurante FOREIGN KEY (RUT) REFERENCES Restaurante(RUT)
);

-- Create Materias_Primas table
CREATE TABLE Materias_Primas (
    ID_Ingrediente INT IDENTITY(1,1) PRIMARY KEY,
    ID_Inventario_MP INT NOT NULL,
    Nombre_Ingrediente VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Fecha_Caducidad DATE,
    Cantidad_Stock DECIMAL(10, 3),
    Unidad_Medida VARCHAR(20),
    CONSTRAINT FK_MateriasPrimas_Inventario FOREIGN KEY (ID_Inventario_MP) REFERENCES Inventario_Materias_Primas(ID_Inventario_MP)
);

-- Create Espacio table
CREATE TABLE Espacio (
    ID_Espacio INT IDENTITY(1,1) PRIMARY KEY,
    ID_Sede INT NOT NULL,
    Capacidad_Maxima INT,
    CONSTRAINT FK_Espacio_Sede FOREIGN KEY (ID_Sede) REFERENCES Sede(ID_Sede)
);

-- Create Mesa table
CREATE TABLE Mesa (
    ID_Mesa INT IDENTITY(1,1) PRIMARY KEY,
    ID_Espacio INT NOT NULL,
    Numero_Mesa INT,
    CONSTRAINT FK_Mesa_Espacio FOREIGN KEY (ID_Espacio) REFERENCES Espacio(ID_Espacio)
);

-- Create Plato table
CREATE TABLE Plato (
    ID_Plato INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Plato VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Precio DECIMAL(12, 2) NOT NULL
);

-- Create Plato_Ingrediente table
CREATE TABLE Plato_Ingrediente (
    ID_Plato_Ingrediente INT IDENTITY(1,1) PRIMARY KEY,
    ID_Plato INT NOT NULL,
    ID_Ingrediente INT NOT NULL,
    Cantidad_Usada DECIMAL(10, 3),
    CONSTRAINT FK_PlatoIngrediente_Plato FOREIGN KEY (ID_Plato) REFERENCES Plato(ID_Plato),
    CONSTRAINT FK_PlatoIngrediente_Ingrediente FOREIGN KEY (ID_Ingrediente) REFERENCES Materias_Primas(ID_Ingrediente)
);

-- Create Orden table con ID_Empleado como VARCHAR
CREATE TABLE Orden (
    ID_Orden INT IDENTITY(1,1) PRIMARY KEY,
    ID_Mesa INT NOT NULL,
    ID_Empleado VARCHAR(20) NOT NULL, -- Cambiado a VARCHAR para coincidir con Empleado(Cedula)
    Fecha_Hora DATETIME2 NOT NULL,
    CONSTRAINT FK_Orden_Mesa FOREIGN KEY (ID_Mesa) REFERENCES Mesa(ID_Mesa),
    CONSTRAINT FK_Orden_Empleado FOREIGN KEY (ID_Empleado) REFERENCES Empleado(Cedula)
);

-- Create Detalle_Orden table
CREATE TABLE Detalle_Orden (
    ID_Detalle_Orden INT IDENTITY(1,1) PRIMARY KEY,
    ID_Orden INT NOT NULL,
    ID_Plato INT NOT NULL,
    Cantidad INT NOT NULL,
    CONSTRAINT FK_DetalleOrden_Orden FOREIGN KEY (ID_Orden) REFERENCES Orden(ID_Orden),
    CONSTRAINT FK_DetalleOrden_Plato FOREIGN KEY (ID_Plato) REFERENCES Plato(ID_Plato)
);

-- Create Factura table
CREATE TABLE Factura (
    ID_Factura INT IDENTITY(1,1) PRIMARY KEY,
    ID_Orden INT NOT NULL,
    Fecha_Emision DATE NOT NULL,
    IVA DECIMAL(12, 2),
    Total DECIMAL(12, 2),
    CONSTRAINT FK_Factura_Orden FOREIGN KEY (ID_Orden) REFERENCES Orden(ID_Orden)
);

-- Create PQRS table
CREATE TABLE PQRS (
    ID_Solicitud INT IDENTITY(1,1) PRIMARY KEY,
    RUT VARCHAR(20) NOT NULL,
    Tipo_Solicitud VARCHAR(50) NOT NULL,
    Descripcion TEXT,
    Fecha DATE NOT NULL,
    CONSTRAINT FK_PQRS_Restaurante FOREIGN KEY (RUT) REFERENCES Restaurante(RUT)
);`,
  
  listRestaurants: `SELECT * FROM Restaurante;`,
  
  listEmployees: `SELECT 
  e.Cedula, 
  e.Nombres,
  e.Numero_Contacto,
  e.Correo_Corporativo,
  a.Nombre_Area AS Area,
  c.Nombre_Cargo AS Cargo,
  s.Nombre_Sede AS Sede
FROM 
  Empleado e
JOIN 
  Area a ON e.ID_Area = a.ID_Area
JOIN 
  Cargo c ON e.ID_Cargo = c.ID_Cargo
JOIN 
  Sede s ON e.ID_Sede = s.ID_Sede
ORDER BY 
  e.Nombres;`,
  
  listInventory: `SELECT 
  mp.Nombre_Ingrediente,
  mp.Cantidad_Stock,
  mp.Unidad_Medida,
  mp.Fecha_Caducidad,
  mp.Descripcion
FROM 
  Materias_Primas mp
JOIN 
  Inventario_Materias_Primas inv ON mp.ID_Inventario_MP = inv.ID_Inventario_MP
ORDER BY 
  mp.Fecha_Caducidad ASC;`,
  
  listOrders: `SELECT 
  o.ID_Orden,
  o.Fecha_Hora,
  m.Numero_Mesa,
  e.Nombres AS Empleado,
  SUM(p.Precio * do.Cantidad) AS Total
FROM 
  Orden o
JOIN 
  Mesa m ON o.ID_Mesa = m.ID_Mesa
JOIN 
  Empleado e ON o.ID_Empleado = e.Cedula
JOIN 
  Detalle_Orden do ON o.ID_Orden = do.ID_Orden
JOIN 
  Plato p ON do.ID_Plato = p.ID_Plato
GROUP BY 
  o.ID_Orden, o.Fecha_Hora, m.Numero_Mesa, e.Nombres
ORDER BY 
  o.Fecha_Hora DESC;`,
  
  revenueByMonth: `SELECT 
  YEAR(f.Fecha_Emision) AS Año,
  MONTH(f.Fecha_Emision) AS Mes,
  SUM(f.Total) AS Ingresos_Totales,
  COUNT(f.ID_Factura) AS Cantidad_Facturas
FROM 
  Factura f
GROUP BY 
  YEAR(f.Fecha_Emision), MONTH(f.Fecha_Emision)
ORDER BY 
  Año DESC, Mes DESC;`
};

export default function Home() {
  // Use the database context
  const { isConnected, currentConnection } = useDatabase();
  
  // State for UI elements
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState('query-editor');
  const [currentTab, setCurrentTab] = useState('general');
  
  // Initial query is the restaurant schema creation
  const [editorQuery, setEditorQuery] = useState<string>(RESTAURANT_TEMPLATES.createRestaurantSchema);
  
  // Template selection handler
  const selectTemplate = (templateKey: keyof typeof RESTAURANT_TEMPLATES) => {
    setEditorQuery(RESTAURANT_TEMPLATES[templateKey]);
  };
  
  // Toggle connection modal
  const openConnectionModal = () => setIsConnectionModalOpen(true);
  const closeConnectionModal = () => setIsConnectionModalOpen(false);

  return (
    <div className="bg-background text-foreground font-sans min-h-screen flex flex-col">
      {/* Header with title and settings */}
      <Header 
        onOpenSettings={openConnectionModal} 
        currentConnection={currentConnection} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar for navigation */}
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        {/* Main content area with query editor */}
        <main className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
          {/* Connection Info Panel */}
          <div className="bg-card p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`}></span>
                <span className="text-sm font-medium">{isConnected ? 'Connected:' : 'Not Connected'}</span>
              </div>
              {isConnected && currentConnection && (
                <div className="text-sm text-muted-foreground">
                  <span>{currentConnection.server} • {currentConnection.database} • {currentConnection.username}</span>
                </div>
              )}
            </div>
            <div className="space-x-2 flex">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Refresh
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary"
                size="sm"
                onClick={openConnectionModal}
              >
                <Database className="h-4 w-4 mr-1" />
                Change Database
              </Button>
            </div>
          </div>

          {/* SQL Query Templates (only visible in SQL Editor) */}
          {activeSection === 'query-editor' && (
            <div className="bg-card p-3 border-b">
              <Tabs defaultValue="general" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="employees"><Users className="h-4 w-4 mr-1" /> Employees</TabsTrigger>
                  <TabsTrigger value="inventory"><ShoppingBasket className="h-4 w-4 mr-1" /> Inventory</TabsTrigger>
                  <TabsTrigger value="reporting"><BarChart className="h-4 w-4 mr-1" /> Reporting</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => selectTemplate('createRestaurantSchema')}>
                    Create Schema
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => selectTemplate('listRestaurants')}>
                    List Restaurants
                  </Button>
                </TabsContent>
                
                <TabsContent value="employees" className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => selectTemplate('listEmployees')}>
                    List Employees
                  </Button>
                </TabsContent>
                
                <TabsContent value="inventory" className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => selectTemplate('listInventory')}>
                    List Inventory
                  </Button>
                </TabsContent>
                
                <TabsContent value="reporting" className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => selectTemplate('revenueByMonth')}>
                    Revenue by Month
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Main Content Area - Switch between SQL Editor and Forms */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {activeSection === 'query-editor' && (
              <>
                {/* Query Editor */}
                <QueryEditor 
                  query={editorQuery}
                  onChange={setEditorQuery}
                />

                <div className="resize-handle hidden lg:block"></div>

                {/* Query Results */}
                <QueryResults />
              </>
            )}
            
            {(activeSection === 'employees' || activeSection === 'inventory' || activeSection === 'orders') && (
              <div className="flex-1 p-6 overflow-auto">
                <DataEntryForms />
              </div>
            )}
            
            {activeSection === 'menu' && (
              <div className="flex-1 p-6 overflow-auto">
                <MenuDisplay />
              </div>
            )}
            
            {activeSection === 'tables-explorer' && (
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Explorador de Tablas</h2>
                  <p className="text-muted-foreground mb-6">Aquí puedes ver la estructura de las tablas de tu base de datos.</p>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Esta funcionalidad mostrará todas las tablas disponibles en tu base de datos conectada.</p>
                  </div>
                </div>
              </div>
            )}
            

            
            {activeSection === 'reports' && (
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Reportes</h2>
                  <p className="text-muted-foreground mb-6">Genera reportes detallados sobre las operaciones del restaurante.</p>
                  <div className="space-y-4">
                    <Button variant="outline" onClick={() => {
                      setActiveSection('query-editor');
                      selectTemplate('revenueByMonth');
                    }}>
                      Ver Ingresos por Mes
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setActiveSection('query-editor');
                      selectTemplate('listOrders');
                    }}>
                      Ver Órdenes Recientes
                    </Button>
                  </div>
                </div>
              </div>
            )}
            

            
            {activeSection === 'history' && (
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Historial de Consultas</h2>
                  <p className="text-muted-foreground mb-6">Revisa las consultas SQL ejecutadas anteriormente.</p>
                  <div className="bg-card p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">El historial de consultas se mostrará aquí.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Database Connection Modal */}
      <ConnectionModal 
        isOpen={isConnectionModalOpen} 
        onClose={closeConnectionModal} 
      />
    </div>
  );
}
