import { defaultRepositoryPorts } from '@viajes/supabase-adapter';

export const environment = {
  production: false,
  supabase: {
    url: '',
    anonKey: ''
  },
  repositories: defaultRepositoryPorts
};
