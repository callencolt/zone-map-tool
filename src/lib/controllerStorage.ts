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
const FIXTURES_BACKUP_KEY = 'fixture_configs_backup';

const hasStorageKey = (key: string) => localStorage.getItem(key) !== null;

const readStorageArray = <T,>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read localStorage key: ${key}`, error);
    return [];
  }
};

const writeStorageArray = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const persistFixtures = (fixtures: FixtureConfig[]) => {
  writeStorageArray(FIXTURES_KEY, fixtures);
  writeStorageArray(FIXTURES_BACKUP_KEY, fixtures);
};

const normalizeFixtureValue = (value: string) => value.trim();

const createRecoveredFixtureId = (
  name: string,
  voltage: string,
  current: string,
) => {
  return `recovered-${[name, voltage, current]
    .map((part) => normalizeFixtureValue(part).toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .filter(Boolean)
    .join('-')}`;
};

const recoverFixtureConfigs = (): FixtureConfig[] => {
  const recoveredFixtures = new Map<string, FixtureConfig>();
  const recoveredAt = new Date().toISOString();

  const addRecoveredFixture = (
    name: string,
    voltage: string,
    current: string,
  ) => {
    const normalizedName = normalizeFixtureValue(name);
    const normalizedVoltage = normalizeFixtureValue(voltage);
    const normalizedCurrent = normalizeFixtureValue(current);

    if (!normalizedName || !normalizedVoltage || !normalizedCurrent) {
      return;
    }

    const recoveryKey = `${normalizedName.toLowerCase()}::${normalizedVoltage}::${normalizedCurrent}`;
    if (recoveredFixtures.has(recoveryKey)) {
      return;
    }

    recoveredFixtures.set(recoveryKey, {
      id: createRecoveredFixtureId(normalizedName, normalizedVoltage, normalizedCurrent),
      name: normalizedName,
      voltage: normalizedVoltage,
      current: normalizedCurrent,
      createdAt: recoveredAt,
    });
  };

  getControllers().forEach((controller) => {
    controller.channels.forEach((channel) => {
      addRecoveredFixture(channel.fixtureType, channel.voltage, channel.current);
    });
  });

  getTemplates().forEach((template) => {
    template.channels.forEach((channel) => {
      addRecoveredFixture(channel.fixtureType, channel.voltage, channel.current);
    });
  });

  return Array.from(recoveredFixtures.values());
};

export const saveController = (controller: ControllerData) => {
  const controllers = getControllers();
  const existingIndex = controllers.findIndex(c => c.id === controller.id);
  
  if (existingIndex >= 0) {
    controllers[existingIndex] = { ...controller, updatedAt: new Date().toISOString() };
  } else {
    controllers.push(controller);
  }
  
  writeStorageArray(CONTROLLERS_KEY, controllers);
};

export const getControllers = (): ControllerData[] => {
  return readStorageArray<ControllerData>(CONTROLLERS_KEY);
};

export const deleteController = (id: string) => {
  const controllers = getControllers().filter(c => c.id !== id);
  writeStorageArray(CONTROLLERS_KEY, controllers);
};

export const deleteControllersByCampus = (campus: string) => {
  const controllers = getControllers().filter(c => c.campus !== campus);
  writeStorageArray(CONTROLLERS_KEY, controllers);
};

export const deleteControllersByBuilding = (campus: string, building: string) => {
  const controllers = getControllers().filter(
    c => !(c.campus === campus && c.building === building)
  );
  writeStorageArray(CONTROLLERS_KEY, controllers);
};

export const deleteControllersByFloor = (campus: string, building: string, floor: string) => {
  const controllers = getControllers().filter(
    c => !(c.campus === campus && c.building === building && c.floor === floor)
  );
  writeStorageArray(CONTROLLERS_KEY, controllers);
};

export const saveTemplate = (template: ControllerTemplate) => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  writeStorageArray(TEMPLATES_KEY, templates);
};

export const getTemplates = (): ControllerTemplate[] => {
  return readStorageArray<ControllerTemplate>(TEMPLATES_KEY);
};

export const deleteTemplate = (id: string) => {
  const templates = getTemplates().filter(t => t.id !== id);
  writeStorageArray(TEMPLATES_KEY, templates);
};

export const saveFixtureConfig = (fixture: FixtureConfig) => {
  const fixtures = getFixtureConfigs();
  const existingIndex = fixtures.findIndex(f => f.id === fixture.id);
  
  if (existingIndex >= 0) {
    fixtures[existingIndex] = fixture;
  } else {
    fixtures.push(fixture);
  }
  
  persistFixtures(fixtures);
};

export const getFixtureConfigs = (): FixtureConfig[] => {
  if (hasStorageKey(FIXTURES_KEY)) {
    const fixtures = readStorageArray<FixtureConfig>(FIXTURES_KEY);
    if (!hasStorageKey(FIXTURES_BACKUP_KEY)) {
      writeStorageArray(FIXTURES_BACKUP_KEY, fixtures);
    }
    return fixtures;
  }

  if (hasStorageKey(FIXTURES_BACKUP_KEY)) {
    const backupFixtures = readStorageArray<FixtureConfig>(FIXTURES_BACKUP_KEY);
    writeStorageArray(FIXTURES_KEY, backupFixtures);
    return backupFixtures;
  }

  const recoveredFixtures = recoverFixtureConfigs();
  if (recoveredFixtures.length > 0) {
    persistFixtures(recoveredFixtures);
  }

  return recoveredFixtures;
};

export const deleteFixtureConfig = (id: string) => {
  const fixtures = getFixtureConfigs().filter(f => f.id !== id);
  persistFixtures(fixtures);
};
