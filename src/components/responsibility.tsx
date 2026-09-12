import { Disclosure } from './disclosure';
import { terasInfo } from '@/lib/domain/teras';
import { displayLabel } from '@/lib/domain/display';

export function Responsibility({ teras }: { teras?: number }) {
  const info = teras ? terasInfo[teras] : null;
  return (
    <Disclosure
      title={info ? `AADK · ${info.committee}` : 'Tanggungjawab & penyelarasan'}
      meta="Rujukan dasar · struktur semasa perlu disahkan"
    >
      <dl className="detail-grid">
        <div>
          <dt>AADK</dt>
          <dd>Peneraju dan penyelaras kelima-lima Teras · ditetapkan dalam DDN 2017.</dd>
        </div>
        <div>
          <dt>JPPP · JRP · JPU</dt>
          <dd>Teras 1 · Teras 2 · Teras 3, masing-masing · ditetapkan dalam DDN 2017.</dd>
        </div>
        <div>
          <dt>JKMD</dt>
          <dd>
            Pengawasan kebangsaan · rujukan dasar; struktur dan kuasa semasa perlu pengesahan pihak
            berkepentingan.
          </dd>
        </div>
        <div>
          <dt>MTMD</dt>
          <dd>
            Penyelarasan negeri dan daerah · rujukan dasar; struktur dan kuasa semasa perlu
            pengesahan pihak berkepentingan.
          </dd>
        </div>
        <div>
          <dt>Teras 4 & 5</dt>
          <dd>
            Tanggungjawab bersama entiti kesihatan, sosial, penguatkuasaan dan hal ehwal
            antarabangsa mengikut skop · pemilik khusus perlu pengesahan.
          </dd>
        </div>
      </dl>
      <p className="chart-caveat">
        {info && `${displayLabel(info.responsibility)} · ${info.source}. `}Rujukan DDN 2017.
        Hierarki semasa mesti disahkan terhadap jentera penyelarasan 2024 sebelum penetapan kuasa
        rasmi. Paparan ini tidak memberikan hak akses.
      </p>
    </Disclosure>
  );
}
