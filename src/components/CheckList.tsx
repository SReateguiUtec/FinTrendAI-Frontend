import { ChecklistCell } from '@/components/ui/checklist-cell';

export default function ChecklistCellDemo() {
  return (
    <ChecklistCell
      className='w-full max-w-sm rounded-2xl'
      initialCompleted={3}
      finalCompleted={6}
      stepInterval={700}
      tasks={[
        'Analizando datos…',
        'Generando predicciones…',
        'Generando informes…',
        'Generando gráficos…',
        'Generando tablas…',
        'Generando conclusiones…',
        'Generando recomendaciones…',
        'Generando acciones…',
        'Generando decisiones…',
      ]}
    />
  );
}
