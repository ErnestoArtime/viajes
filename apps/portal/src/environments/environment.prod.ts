import { defaultRepositoryPorts } from '@viajes/supabase-adapter';

export const environment = {
  production: true,
  supabase: {
    url: '',
    anonKey: ''
  },
  repositories: defaultRepositoryPorts
};
