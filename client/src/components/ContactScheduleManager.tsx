
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Phone, Mail, MessageCircle, Instagram, MapPin, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ContactScheduleManagerProps {
  contactSettings: any;
}

export default function ContactScheduleManager({ contactSettings }: ContactScheduleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const contactItemSchema = z.object({
    type: z.string().min(1, "Tipo é obrigatório"),
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    icon: z.string().min(1, "Ícone é obrigatório"),
    color: z.string().min(1, "Cor é obrigatória"),
    link: z.string().min(1, "Link é obrigatório"),
    isActive: z.boolean(),
    order: z.number().min(0),
  });

  type ContactItemForm = z.infer<typeof contactItemSchema>;

  const form = useForm<ContactItemForm>({
    resolver: zodResolver(contactItemSchema),
    defaultValues: {
      type: "whatsapp",
      title: "",
      description: "",
      icon: "MessageCircle",
      color: "#25D366",
      link: "",
      isActive: true,
      order: 0,
    },
  });

  const scheduleForm = useForm({
    defaultValues: {
      weekSchedule: "",
      saturdaySchedule: "",
      sundaySchedule: "",
      additionalInfo: "",
      isActive: true,
    },
  });

  const locationForm = useForm({
    defaultValues: {
      city: "",
      mapsLink: "",
      isActive: true,
    },
  });

  // Mutations
  const updateContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/contact-settings/${contactSettings?.id || 1}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-settings"] });
      toast({ title: "Configurações de contato atualizadas com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (contactSettings) {
      const scheduleInfo = contactSettings.schedule_info || {};
      const locationInfo = contactSettings.location_info || {};

      scheduleForm.reset({
        weekSchedule: scheduleInfo.week || "",
        saturdaySchedule: scheduleInfo.saturday || "",
        sundaySchedule: scheduleInfo.sunday || "",
        additionalInfo: scheduleInfo.additional || "",
        isActive: scheduleInfo.isActive ?? true,
      });

      locationForm.reset({
        city: locationInfo.city || "",
        mapsLink: locationInfo.maps_link || "",
        isActive: locationInfo.isActive ?? true,
      });
    }
  }, [contactSettings, scheduleForm, locationForm]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const contactItems = contactSettings?.contact_items || [];
    const oldIndex = contactItems.findIndex((item: any) => item.id === active.id);
    const newIndex = contactItems.findIndex((item: any) => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(contactItems, oldIndex, newIndex).map((item: any, index: number) => ({
      ...item,
      order: index
    }));

    updateContactMutation.mutate({
      contact_items: newItems,
      schedule_info: contactSettings?.schedule_info,
      location_info: contactSettings?.location_info,
    });
  };

  const onSubmitContactItem = (data: ContactItemForm) => {
    const contactItems = contactSettings?.contact_items || [];
    let newItems;

    if (editingItem) {
      newItems = contactItems.map((item: any) => 
        item.id === editingItem.id ? { ...item, ...data } : item
      );
    } else {
      const newId = Math.max(...contactItems.map((item: any) => item.id), 0) + 1;
      const newItem = {
        id: newId,
        ...data,
        order: contactItems.length
      };
      newItems = [...contactItems, newItem];
    }

    updateContactMutation.mutate({
      contact_items: newItems,
      schedule_info: contactSettings?.schedule_info,
      location_info: contactSettings?.location_info,
    });
  };

  const deleteContactItem = (id: number) => {
    const contactItems = contactSettings?.contact_items || [];
    const newItems = contactItems
      .filter((item: any) => item.id !== id)
      .map((item: any, index: number) => ({ ...item, order: index }));

    updateContactMutation.mutate({
      contact_items: newItems,
      schedule_info: contactSettings?.schedule_info,
      location_info: contactSettings?.location_info,
    });
  };

  const updateSchedule = (data: any) => {
    updateContactMutation.mutate({
      contact_items: contactSettings?.contact_items || [],
      schedule_info: {
        week: data.weekSchedule,
        saturday: data.saturdaySchedule,
        sunday: data.sundaySchedule,
        additional: data.additionalInfo,
        isActive: data.isActive,
      },
      location_info: contactSettings?.location_info,
    });
  };

  const updateLocation = (data: any) => {
    updateContactMutation.mutate({
      contact_items: contactSettings?.contact_items || [],
      schedule_info: contactSettings?.schedule_info,
      location_info: {
        city: data.city,
        maps_link: data.mapsLink,
        isActive: data.isActive,
      },
    });
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    form.reset({
      type: item.type || "whatsapp",
      title: item.title || "",
      description: item.description || "",
      icon: item.icon || "MessageCircle",
      color: item.color || "#25D366",
      link: item.link || "",
      isActive: item.isActive ?? true,
      order: item.order || 0,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const iconOptions = [
    { value: "MessageCircle", label: "WhatsApp", icon: MessageCircle },
    { value: "Instagram", label: "Instagram", icon: Instagram },
    { value: "Mail", label: "Email", icon: Mail },
    { value: "Phone", label: "Telefone", icon: Phone },
  ];

  return (
    <div className="space-y-6">
      {/* Configurações de Visibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Controles de Visibilidade
          </CardTitle>
          <CardDescription>
            Ative ou desative os horários e localização individualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Exibir Localização</h4>
                <p className="text-sm text-muted-foreground">Mostrar cidade e link do Google Maps</p>
              </div>
              <Switch 
                checked={locationForm.watch("isActive")}
                onCheckedChange={(checked) => {
                  locationForm.setValue("isActive", checked);
                  updateLocation(locationForm.getValues());
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Exibir Horários</h4>
                <p className="text-sm text-muted-foreground">Mostrar horários de funcionamento</p>
              </div>
              <Switch 
                checked={scheduleForm.watch("isActive")}
                onCheckedChange={(checked) => {
                  scheduleForm.setValue("isActive", checked);
                  updateSchedule(scheduleForm.getValues());
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Botões de Contato */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Botões de Contato
              </CardTitle>
              <CardDescription>
                Configure e organize os botões de contato
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Botão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Botão de Contato" : "Novo Botão de Contato"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure as informações do botão de contato
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitContactItem)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ícone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o ícone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {iconOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <option.icon className="w-4 h-4" />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="WhatsApp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Agende sua consulta" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://wa.me/5544..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativo</FormLabel>
                            <FormDescription>
                              Exibir este botão de contato
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={updateContactMutation.isPending}>
                        {editingItem ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={(contactSettings?.contact_items || []).map((item: any) => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {(contactSettings?.contact_items || [])
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((item: any) => (
                    <SortableContactItem 
                      key={item.id} 
                      item={item}
                      onEdit={() => openEditDialog(item)}
                      onDelete={() => deleteContactItem(item.id)}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Configurar Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...scheduleForm}>
            <form onSubmit={scheduleForm.handleSubmit(updateSchedule)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={scheduleForm.control}
                  name="weekSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segunda a Sexta</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00 - 18:00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="saturdaySchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sábado</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00 - 12:00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="sundaySchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domingo</FormLabel>
                      <FormControl>
                        <Input placeholder="Fechado" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={scheduleForm.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Informações extras sobre horários..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateContactMutation.isPending}>
                Salvar Horários
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Configurar Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...locationForm}>
            <form onSubmit={locationForm.handleSubmit(updateLocation)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Campo Mourão, Paraná" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="mapsLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Google Maps</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={updateContactMutation.isPending}>
                Salvar Localização
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para item arrastável de contato
function SortableContactItem({ item, onEdit, onDelete }: { 
  item: any; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageCircle": return MessageCircle;
      case "Instagram": return Instagram;
      case "Mail": return Mail;
      case "Phone": return Phone;
      default: return MessageCircle;
    }
  };

  const Icon = getIcon(item.icon);

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: item.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{item.title}</h4>
              <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                {item.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">Ordem: {item.order}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
