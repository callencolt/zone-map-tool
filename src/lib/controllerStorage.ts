export interface Channel {
  id: string;
  channelNumber: number;
  fixtureType: string;
  voltage: string;
  current: string;
}

export interface ControllerData {
  id: string;
  campus: string;
  building: string;
  floor: string;
  zone: string;
  controllerNumber: string;
  channels: Channel[];
  powerLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ControllerTemplate {
  id: string;
  name: string;
  description: string;
  channels: Omit<Channel, 'id'>[];
  createdAt: string;
}

const CONTROLLERS_KEY = 'controller_docs';
const TEMPLATES_KEY = 'controller_templates';

export const saveController = (controller: ControllerData) => {
  const controllers = getControllers();
  const existingIndex = controllers.findIndex(c => c.id === controller.id);
  
  if (existingIndex >= 0) {
    controllers[existingIndex] = { ...controller, updatedAt: new Date().toISOString() };
  } else {
    controllers.push(controller);
  }
  
  localStorage.setItem(CONTROLLERS_KEY, JSON.stringify(controllers));
};

export const getControllers = (): ControllerData[] => {
  const data = localStorage.getItem(CONTROLLERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteController = (id: string) => {
  const controllers = getControllers().filter(c => c.id !== id);
  localStorage.setItem(CONTROLLERS_KEY, JSON.stringify(controllers));
};

export const saveTemplate = (template: ControllerTemplate) => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getTemplates = (): ControllerTemplate[] => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (id: string) => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};
