import { CONFIG } from 'src/config-global';

import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Minha Conta - ${CONFIG.appName}`}</title>

      <AccountView />
    </>
  );
}
