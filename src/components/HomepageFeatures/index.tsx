import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Zero-Knowledge Security',
    Svg: require('@site/static/img/zero-knowledge-icon.svg').default,
    description: (
      <>
        Your sensitive data remains completely private with client-side encryption.
        Logs are encrypted before they leave your system, and only you hold the keys.
      </>
    ),
  },
  {
    title: 'AI Integration',
    Svg: require('@site/static/img/ai-integration-icon.svg').default,
    description: (
      <>
        Leverage AI with NeuralLog's Model Context Protocol (MCP).
        Connect logs directly to AI agents for intelligent analysis while maintaining security.
      </>
    ),
  },
  {
    title: 'Multi-Language Support',
    Svg: require('@site/static/img/multi-language-icon.svg').default,
    description: (
      <>
        SDKs for TypeScript, Java, C#, Python, and Go, with adapters for popular logging frameworks.
        Integrate with your existing applications with minimal code changes.
      </>
    ),
  },
  {
    title: 'Early Warning Signals',
    Svg: require('@site/static/img/early-warning-icon.svg').default,
    description: (
      <>
        Detect issues before they impact users with NeuralLog's early warning system.
        Identify unusual patterns and anomalies that traditional monitoring misses.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
