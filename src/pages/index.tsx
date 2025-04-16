import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h1" className="hero__title">
              NeuralLog
            </Heading>
            <p className="hero__subtitle">AI-powered insights. Mathematically private.</p>
            <p className={styles.heroTagline}>
              Transform your logs into business intelligence without exposing sensitive data. Our zero-knowledge architecture makes it mathematically impossible for anyone — including us — to access your private information.
            </p>
            <div className={styles.buttons}>
              <div className={styles.buttonContainer}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/getting-started/quick-start">
                  Turn Your Logs Into Intelligence
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/security/zero-knowledge-architecture">
                  See How We Keep Data Private
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.heroGraphic}>
              <img src="/img/zk-server.png" alt="Zero Knowledge Security" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureSection() {
  return (
    <section className={styles.featureSection}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className={styles.featureCard}>
              <img src="/img/zero-knowledge-icon.svg" alt="Zero Knowledge Security" className={styles.featureIcon} />
              <Heading as="h3">Complete Data Privacy</Heading>
              <p>Your sensitive data remains completely private with client-side encryption. We mathematically cannot access your log content.</p>
              <Link to="/docs/security/zero-knowledge-architecture" className={styles.featureLink}>Explore our security →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.featureCard}>
              <img src="/img/ai-integration-icon.svg" alt="AI Integration" className={styles.featureIcon} />
              <Heading as="h3">AI-Powered Insights</Heading>
              <p>Connect your logs directly to AI agents for intelligent analysis and insights while maintaining zero-knowledge security.</p>
              <Link to="/docs/components/mcp-client" className={styles.featureLink}>Learn about AI integration →</Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.featureCard}>
              <img src="/img/multi-language-icon.svg" alt="Multi-Language Support" className={styles.featureIcon} />
              <Heading as="h3">Zero Friction Integration</Heading>
              <p>Add NeuralLog to your existing logging with just a few lines of code. Works with all major logging frameworks.</p>
              <Link to="/docs/getting-started/quick-start" className={styles.featureLink}>Get started in minutes →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationSection() {
  return (
    <section className={styles.integrationSection}>
      <div className="container">
        <div className="row">
          <div className="col col--5">
            <div className={styles.integrationContent}>
              <Heading as="h2" className={styles.integrationTitle}>
                Add to your existing logging in minutes
              </Heading>
              <p className={styles.integrationDescription}>
                NeuralLog integrates seamlessly with your current logging setup. No need to change your logging patterns or learn new APIs.
              </p>
              <ul className={styles.integrationList}>
                <li><strong>One-line integration</strong> with popular frameworks</li>
                <li><strong>Zero learning curve</strong> for your development team</li>
                <li><strong>Automatic encryption</strong> of sensitive data</li>
                <li><strong>Works with</strong> Winston, Log4j, Serilog, and more</li>
              </ul>
              <div className={styles.integrationButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/components/logger-adapters/overview">
                  View Integration Guides
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--7">
            <div className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <div className={styles.codeDot}></div>
                <div className={styles.codeDot}></div>
                <div className={styles.codeDot}></div>
                <span>Add to Winston in TypeScript</span>
              </div>
              <CodeBlock language="typescript">
                {`import winston from 'winston';
import { NeuralLogger } from '@neurallog/typescript-client-sdk';

// Your existing Winston logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    // Add NeuralLog with one line
    new NeuralLogger.WinstonTransport({
      apiKey: 'your-api-key',
      logName: 'application-logs',
    })
  ]
});

// Log as usual - encryption happens automatically
logger.info('User logged in', {
  userId: 'user-123',
  email: 'user@example.com', // Sensitive data is encrypted
  ipAddress: '192.168.1.1',
  timestamp: new Date().toISOString()
});`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className={styles.securitySection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className={styles.securityImage}>
              <img src="/img/zk-server.png" alt="Zero Knowledge Security" />
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.securityContent}>
              <Heading as="h2" className={styles.securityTitle}>
                We <span>cannot</span> see your data, even if we wanted to
              </Heading>
              <p className={styles.securityDescription}>
                Unlike traditional logging services that have full access to your sensitive data, NeuralLog's zero-knowledge architecture makes it mathematically impossible for us to access your log content.
              </p>
              <div className={styles.securityFeatures}>
                <div className={styles.securityFeature}>
                  <div className={styles.securityFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#1677FF"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Client-Side Encryption</h3>
                    <p>All data is encrypted on your systems before transmission</p>
                  </div>
                </div>
                <div className={styles.securityFeature}>
                  <div className={styles.securityFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#1677FF"/>
                    </svg>
                  </div>
                  <div>
                    <h3>No Server Keys</h3>
                    <p>Our servers never possess the encryption keys</p>
                  </div>
                </div>
                <div className={styles.securityFeature}>
                  <div className={styles.securityFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#1677FF"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Blind Processing</h3>
                    <p>We process and index your data without ever seeing its contents</p>
                  </div>
                </div>
              </div>
              <div className={styles.securityButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/security/zero-knowledge-architecture">
                  Explore Our Security Architecture
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MCPSection() {
  return (
    <section className={styles.mcpSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className={styles.mcpContent}>
              <Heading as="h2" className={styles.mcpTitle}>
                Turn your logs into <span>AI-powered insights</span>
              </Heading>
              <p className={styles.mcpDescription}>
                NeuralLog's Model Context Protocol (MCP) integration gives AI agents automatic access to your logs from day one. Your AI tools and chatbots can immediately search, analyze, and extract insights from your logs while still maintaining zero-knowledge security for sensitive data.
              </p>
              <div className={styles.mcpFeatures}>
                <div className={styles.mcpFeature}>
                  <div className={styles.mcpFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#52C41A"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Standardized AI Integration</h3>
                    <p>Connect any MCP-compatible AI agent to your logs with a unified interface</p>
                  </div>
                </div>
                <div className={styles.mcpFeature}>
                  <div className={styles.mcpFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#52C41A"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Seamless AI Access</h3>
                    <p>AI tools get immediate access to your logs from day one, with zero configuration</p>
                  </div>
                </div>
                <div className={styles.mcpFeature}>
                  <div className={styles.mcpFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="#52C41A"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Instant AI Value</h3>
                    <p>Get AI-powered insights from your very first log entry - no training or setup required</p>
                  </div>
                </div>
              </div>
              <div className={styles.mcpButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/components/mcp-client/overview">
                  Learn About MCP Integration
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.mcpConversation}>
              <div className={styles.mcpChatHeader}>
                <div className={styles.mcpChatDot}></div>
                <div className={styles.mcpChatDot}></div>
                <div className={styles.mcpChatDot}></div>
                <span>AI Assistant</span>
              </div>
              <div className={styles.mcpChatBody}>
                <div className={styles.mcpChatMessage + ' ' + styles.mcpChatUser}>
                  <div className={styles.mcpChatAvatar}>👤</div>
                  <div className={styles.mcpChatContent}>
                    <p>Can you check our logs for any authentication failures in the last 24 hours?</p>
                  </div>
                </div>

                <div className={styles.mcpChatMessage + ' ' + styles.mcpChatAssistant}>
                  <div className={styles.mcpChatAvatar}>🤖</div>
                  <div className={styles.mcpChatContent}>
                    <p>I'll search the logs for authentication failures in the last 24 hours.</p>
                    <div className={styles.mcpChatCode}>
                      <div className={styles.mcpChatCodeHeader}>Searching logs...</div>
                      <pre>{`search_logs_neurallog({
  query: "level:error AND message:*authentication*",
  timeRange: "24h",
  limit: 10
})`}</pre>
                    </div>
                    <p>I found 3 authentication failures in the last 24 hours:</p>
                    <ul>
                      <li><strong>2023-06-15 14:23:17</strong>: Failed login attempt for user 'admin' from IP 192.168.1.105 - Invalid password</li>
                      <li><strong>2023-06-15 18:45:32</strong>: Failed login attempt for user 'jsmith' from IP 203.0.113.42 - Account locked</li>
                      <li><strong>2023-06-16 09:12:05</strong>: Failed login attempt for user 'admin' from IP 192.168.1.105 - Invalid password</li>
                    </ul>
                    <p>It appears there might be a brute force attempt on the admin account from IP 192.168.1.105. Would you like me to provide more details or suggest security measures?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            Start logging securely in minutes
          </Heading>
          <div className={styles.ctaHighlights}>
            <div className={styles.ctaHighlight}>
              <span className={styles.ctaHighlightNumber}>0</span>
              <span className={styles.ctaHighlightText}>Knowledge Exposure</span>
            </div>
            <div className={styles.ctaHighlight}>
              <span className={styles.ctaHighlightNumber}>0</span>
              <span className={styles.ctaHighlightText}>Friction Integration</span>
            </div>
            <div className={styles.ctaHighlight}>
              <span className={styles.ctaHighlightNumber}>0</span>
              <span className={styles.ctaHighlightText}>Cost to Start</span>
            </div>
          </div>
          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/getting-started/quick-start">
              Get Started Now
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/components/client-sdks/overview">
              Explore SDKs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Zero Knowledge Telemetry and Logging`}
      description="NeuralLog - Zero Knowledge Telemetry and Logging Service with AI Integration">
      <HomepageHeader />
      <main>
        <FeatureSection />
        <SecuritySection />
        <IntegrationSection />
        <MCPSection />
        <CTASection />
      </main>
    </Layout>
  );
}
