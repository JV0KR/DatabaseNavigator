import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { connectionFormSchema } from '@shared/schema';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/contexts/database-context';
import { Loader2 } from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = z.infer<typeof connectionFormSchema>;

export default function ConnectionModal({ isOpen, onClose }: ConnectionModalProps) {
  const { testConnection, saveConnection } = useDatabase();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingConnection, setIsSavingConnection] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: "Development DB",
      server: "localhost",
      authentication: "SQL Server Authentication",
      username: "sa",
      password: "",
      database: "master",
      saveCredentials: false
    }
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleTestConnection = async (data: FormValues) => {
    setIsTestingConnection(true);
    try {
      await testConnection(data);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConnection = async (data: FormValues) => {
    setIsSavingConnection(true);
    try {
      const result = await saveConnection(data);
      if (result) {
        onClose();
      }
    } finally {
      setIsSavingConnection(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-secondary-900">Database Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSaveConnection)}>
          <div className="px-1 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectionName">Connection Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="connectionName"
                      placeholder="My SQL Server"
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverAddress">Server Address</Label>
                <Controller
                  name="server"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="serverAddress"
                      placeholder="localhost\SQLEXPRESS"
                      {...field}
                    />
                  )}
                />
                {errors.server && (
                  <p className="text-sm text-destructive">{errors.server.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authentication">Authentication</Label>
                <Controller
                  name="authentication"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="authentication">
                        <SelectValue placeholder="Select Authentication" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQL Server Authentication">SQL Server Authentication</SelectItem>
                        <SelectItem value="Windows Authentication">Windows Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.authentication && (
                  <p className="text-sm text-destructive">{errors.authentication.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="username"
                      placeholder="sa"
                      {...field}
                    />
                  )}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Controller
                  name="database"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="database"
                      placeholder="master"
                      {...field}
                    />
                  )}
                />
                {errors.database && (
                  <p className="text-sm text-destructive">{errors.database.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="saveCredentials"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="saveCredentials"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="saveCredentials">Save credentials</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isTestingConnection}
              onClick={handleSubmit(handleTestConnection)}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSavingConnection}
              className="bg-success hover:bg-green-600 text-white"
            >
              {isSavingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
