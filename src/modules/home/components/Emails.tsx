import React, { useEffect } from 'react';
import { FiMail, FiUser, FiClock, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { Button } from '@chakra-ui/react';
import { useGmail } from '../../../shared/hooks/useGmail';
import { useStressAnalytics } from '../../../shared/hooks/useStressAnalytics';
import type { GmailMessageWithStress } from '../../../shared/types/gmail.types';

const Emails: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    profile,
    emails,
    isLoadingEmails,
    emailsError,
    authenticate,
    signOut,
    fetchEmails,
    getStressStatistics,
    hasUrgentEmails,
  } = useGmail();

  const { isCurrentlyStressed } = useStressAnalytics();

  // Fetch emails when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails({ maxResults: 5 });
    }
  }, [isAuthenticated, fetchEmails]);

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get stress color based on priority
  const getStressColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#ff4757';
      case 'medium':
        return '#ffa502';
      case 'low':
        return '#26de81';
      default:
        return '#747d8c';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <FiAlertTriangle color="#ff4757" />;
      case 'medium':
        return <FiClock color="#ffa502" />;
      default:
        return <FiMail color="#26de81" />;
    }
  };

  // Render single email item
  const EmailItem: React.FC<{ email: GmailMessageWithStress }> = ({ email }) => (
    <div
      style={{
        padding: '12px',
        margin: '8px 0',
        borderRadius: '8px',
        border: `1px solid ${getStressColor(email.stressAnalysis?.priority || 'low')}`,
        backgroundColor: email.read ? '#f8f9fa' : '#ffffff',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getPriorityIcon(email.stressAnalysis?.priority || 'low')}
          <span style={{ fontWeight: email.read ? 'normal' : 'bold', fontSize: '14px' }}>
            {email.from.includes('<') ? email.from.split('<')[0].trim() : email.from}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6c757d' }}>
          <FiCalendar size={12} />
          {formatDate(email.date)}
        </div>
      </div>

      <h4
        style={{
          margin: '4px 0',
          fontSize: '16px',
          fontWeight: email.read ? 'normal' : 'bold',
          color: '#2c3e50',
          lineHeight: '1.3',
        }}
      >
        {email.subject || '(No Subject)'}
      </h4>

      <p
        style={{
          margin: '4px 0',
          fontSize: '14px',
          color: '#6c757d',
          lineHeight: '1.4',
          maxHeight: '40px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {email.snippet}
      </p>

      {email.stressAnalysis && (
        <div
          style={{
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: `${getStressColor(email.stressAnalysis.priority)}20`,
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: getStressColor(email.stressAnalysis.priority), fontWeight: 'bold' }}>
              {email.stressAnalysis.priority.toUpperCase()} PRIORITY
            </span>
            <span style={{ color: '#6c757d' }}>Stress Score: {email.stressAnalysis.stressScore}%</span>
          </div>
          {email.stressAnalysis.suggestedAction && (
            <p style={{ margin: '4px 0 0 0', color: '#495057', fontStyle: 'italic' }}>
              💡 {email.stressAnalysis.suggestedAction}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p>Initializing Gmail integration...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isCurrentlyStressed ? '#ffebee' : '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <FiMail
          size={48}
          style={{ color: '#6c757d', marginBottom: '16px' }}
        />
        <h3 style={{ marginBottom: '12px', color: '#2c3e50' }}>Connect Your Gmail</h3>
        <p
          style={{
            marginBottom: '20px',
            color: '#6c757d',
            maxWidth: '400px',
            margin: '0 auto 20px auto',
            lineHeight: '1.5',
          }}
        >
          Connect your Gmail account to view your latest emails with intelligent stress analysis. We'll help you
          prioritize what's important and suggest when to take breaks.
        </p>

        {isCurrentlyStressed && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#856404',
            }}
          >
            😰 <strong>Stress detected!</strong> Connecting your email can help us provide better recommendations.
          </div>
        )}

        <Button
          onClick={authenticate}
          size="lg"
          style={{
            backgroundColor: '#4285f4',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
          }}
          disabled={isLoading}
        >
          <FiUser />
          {isLoading ? 'Connecting...' : 'Connect Gmail Account'}
        </Button>

        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '6px',
              color: '#721c24',
              fontSize: '14px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
          <p>
            🔒 <strong>Privacy & Security:</strong>
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <li>✅ Read-only access to your emails</li>
            <li>✅ No data stored on our servers</li>
            <li>✅ Disconnect anytime</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show authenticated state with emails
  const stressStats = getStressStatistics();
  const urgentEmails = hasUrgentEmails();

  console.log('emails:', emails);

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with profile info and disconnect option */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: urgentEmails ? '#fff3cd' : '#e8f5e8',
          borderRadius: '8px',
          border: `1px solid ${urgentEmails ? '#ffeaa7' : '#c3e6cb'}`,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>📧 Gmail Integration</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
            Connected as: <strong>{profile?.emailAddress}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {urgentEmails && (
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#ff4757',
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              🚨 Urgent Emails!
            </div>
          )}

          <Button
            onClick={signOut}
            size="sm"
            variant="outline"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #6c757d',
              color: '#6c757d',
            }}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Stress Statistics */}
      {stressStats.totalEmails > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#26de81' }}>{stressStats.lowStressEmails}</div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Low Stress</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fff3e0', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffa502' }}>
              {stressStats.mediumStressEmails}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Medium Stress</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#ffebee', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>{stressStats.highStressEmails}</div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>High Stress</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
              {stressStats.averageStressScore}%
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Avg Stress</div>
          </div>
        </div>
      )}

      {/* Loading emails */}
      {isLoadingEmails && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px auto',
            }}
          />
          <p>Loading your emails...</p>
        </div>
      )}

      {/* Email error */}
      {emailsError && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            color: '#721c24',
            marginBottom: '16px',
          }}
        >
          ⚠️ Failed to load emails: {emailsError}
        </div>
      )}

      {/* Emails list */}
      {emails.length > 0 ? (
        <div>
          <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>Recent Emails ({emails.length})</h3>

          {emails.map((email) => (
            <EmailItem
              key={email.id}
              email={email}
            />
          ))}

          {/* Refresh button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              onClick={() => fetchEmails({ maxResults: 5 })}
              disabled={isLoadingEmails}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {isLoadingEmails ? 'Refreshing...' : 'Refresh Emails'}
            </Button>
          </div>
        </div>
      ) : !isLoadingEmails && !emailsError ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
          }}
        >
          <FiMail
            size={48}
            style={{ marginBottom: '16px' }}
          />
          <p>No emails found in your inbox.</p>
        </div>
      ) : null}
    </div>
  );
};

export default Emails;
