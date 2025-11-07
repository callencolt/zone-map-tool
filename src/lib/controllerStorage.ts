export interface Channel {
  id: string;
  channelNumber: number;
  fixtureType: string;
  voltage: string;
  current: string;
  parallelCount: number;
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
  campus?: string;
  building?: string;
  floor?: string;
  zone?: string;
  controllerNumber?: string;
  powerLimit?: number;
  channels: Omit<Channel, 'id'>[];
  createdAt: string;
}

export interface FixtureConfig {
  id: string;
  name: string;
  voltage: string;
  current: string;
  createdAt: string;
}

const CONTROLLERS_KEY = 'controller_docs';
const TEMPLATES_KEY = 'controller_templates';
const FIXTURES_KEY = 'fixture_configs';

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

export const saveFixtureConfig = (fixture: FixtureConfig) => {
  const fixtures = getFixtureConfigs();
  const existingIndex = fixtures.findIndex(f => f.id === fixture.id);
  
  if (existingIndex >= 0) {
    fixtures[existingIndex] = fixture;
  } else {
    fixtures.push(fixture);
  }
  
  localStorage.setItem(FIXTURES_KEY, JSON.stringify(fixtures));
};

export const getFixtureConfigs = (): FixtureConfig[] => {
  const data = localStorage.getItem(FIXTURES_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteFixtureConfig = (id: string) => {
  const fixtures = getFixtureConfigs().filter(f => f.id !== id);
  localStorage.setItem(FIXTURES_KEY, JSON.stringify(fixtures));
};
