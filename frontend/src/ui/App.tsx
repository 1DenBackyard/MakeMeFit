import React from "react";
      setFullAnswer(null);
    }
  };

  const handleViewHistory = async () => {
    try {
      const h = await getHistory();
      setHistory(h);
      setState('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      setState('error');
    }
  };

  // Render based on state
  if (state === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2 style={styles.errorTitle}>Oops!</h2>
          <p style={styles.errorText}>{error || 'Something went wrong'}</p>
          <button style={styles.button} onClick={() => setState('track_selection')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (state === 'track_selection') {
    return (
      <div style={styles.app}>
        <TrackSelection onSelect={handleTrackSelect} />
      </div>
    );
  }

  if (state === 'form') {
    return (
      <div style={styles.app}>
        {selectedTrack === 'supplements' ? (
          <SupplementsForm onSubmit={handleFormSubmit} />
        ) : (
          <WorkoutsForm onSubmit={handleFormSubmit} />
        )}
      </div>
    );
  }

  if (state === 'demo' && demoResponse) {
    return (
      <div style={styles.app}>
        <DemoAnswer demo={demoResponse} onUnlock={handleUnlock} />
      </div>
    );
  }

  if (state === 'full_answer' && fullAnswer) {
    return (
      <div style={styles.app}>
        <FullAnswer 
          answer={fullAnswer} 
          onTrainerReferral={() => {
            // TODO: Implement trainer referral
            WebApp.showAlert('Trainer referral coming soon!');
          }}
        />
      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
  },
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  loader: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  errorBox: {
    textAlign: 'center',
    maxWidth: '400px',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  button: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.normal,
  },
};