/** Workouts form component. */
import { useState } from 'react';

interface WorkoutsFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
}

export function WorkoutsForm({ onSubmit }: WorkoutsFormProps) {
  const [formData, setFormData] = useState({
    goal: '',
    fitness_level: 'beginner',
    available_equipment: [] as string[],
    time_per_week: '3',
    preferred_activities: [] as string[],
    injuries: '',
    age: '',
    weight: '',
    height: '',
  });

  const equipmentOptions = ['None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Gym Access'];
  const activityOptions = ['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Running', 'Cycling'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      time_per_week: parseInt(formData.time_per_week),
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Tell Us About Your Fitness Goals</h2>
      
      <div style={styles.field}>
        <label style={styles.label}>What's your goal? *</label>
        <textarea
          style={styles.textarea}
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          placeholder="e.g., Build muscle, lose weight, improve endurance..."
          required
          rows={3}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Fitness Level *</label>
        <select
          style={styles.select}
          value={formData.fitness_level}
          onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
          required
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Time per Week (hours) *</label>
        <input
          type="number"
          style={styles.input}
          value={formData.time_per_week}
          onChange={(e) => setFormData({ ...formData, time_per_week: e.target.value })}
          required
          min="1"
          max="14"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Available Equipment</label>
        <div style={styles.checkboxGroup}>
          {equipmentOptions.map((eq) => (
            <label key={eq} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.available_equipment.includes(eq)}
                onChange={() =>
                  setFormData({
                    ...formData,
                    available_equipment: toggleArrayItem(formData.available_equipment, eq),
                  })
                }
              />
              {eq}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Preferred Activities</label>
        <div style={styles.checkboxGroup}>
          {activityOptions.map((act) => (
            <label key={act} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.preferred_activities.includes(act)}
                onChange={() =>
                  setFormData({
                    ...formData,
                    preferred_activities: toggleArrayItem(formData.preferred_activities, act),
                  })
                }
              />
              {act}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Injuries or Limitations</label>
        <textarea
          style={styles.textarea}
          value={formData.injuries}
          onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
          placeholder="List any injuries or physical limitations..."
          rows={2}
        />
      </div>

      <button type="submit" style={styles.submitButton}>
        Get Workout Plan
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    background: '#2481cc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '24px',
  },
};
