import React from 'react';
import styled from 'styled-components';
import { Code2, Github, Heart, Coffee } from 'lucide-react';

const AboutContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const AboutCard = styled.div`
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px ${props => props.theme.name === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.1)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.name === 'dark' 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(75, 0, 130, 0.05))' 
      : 'linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(75, 0, 130, 0.02))'};
    z-index: -1;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const ProfileImage = styled.img`
  width: 165px;
  height: 220px;
  border-radius: 12px;
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
  border: 4px solid #8a2be2;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #8a2be2, #4b0082);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme.name === 'dark' ? '#b0b0b0' : '#666'};
  margin: 0 0 1rem 0;
`;

const Description = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: ${props => props.theme.name === 'dark' ? '#e0e0e0' : '#333'};
  margin-bottom: 2rem;
  text-align: justify;

  p {
    margin-bottom: 1rem;
    text-align: justify;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 15px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px ${props => props.theme.name === 'dark' 
      ? 'rgba(138, 43, 226, 0.2)' 
      : 'rgba(138, 43, 226, 0.15)'};
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#333'};
  }

  p {
    color: ${props => props.theme.name === 'dark' ? '#b0b0b0' : '#666'};
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 25px;
  color: ${props => props.theme.name === 'dark' ? '#e0e0e0' : '#333'};
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: linear-gradient(135deg, #8a2be2, #4b0082);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
  }
`;

const FeedbackForm = () => {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  return (
    <form action="https://formspree.io/f/mblkbeyp" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'stretch', maxWidth: 420, margin: '0 auto' }}>
      <input name="name" type="text" placeholder="Your name" style={{ width: '100%', borderRadius: 12, padding: '0.75rem 1rem', border: '1.5px solid #8a2be2', fontSize: '1rem', background: '#fff', boxShadow: '0 2px 8px rgba(138,43,226,0.04)' }} required />
      <div style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}>
        <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: '1rem' }}>Rating:</label>
        <div style={{ display: 'flex', gap: 8, margin: '6px 0' }}>
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              style={{
                fontSize: 28,
                color: (hover || rating) >= star ? '#FFD700' : '#ccc',
                filter: (hover || rating) >= star ? 'drop-shadow(0 1px 2px #8a2be2)' : 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >★</span>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} required />
      </div>
  <textarea name="feedback" rows="4" placeholder="Your feedback..." style={{ width: '100%', borderRadius: 12, padding: '0.75rem 1rem', border: '1.5px solid #8a2be2', fontSize: '1rem', background: '#fff', boxShadow: '0 2px 8px rgba(138,43,226,0.04)' }} required />
      <button type="submit" style={{ background: 'linear-gradient(90deg,#8a2be2,#4b0082)', color: 'white', border: 'none', borderRadius: 12, padding: '0.75rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px rgba(138,43,226,0.08)', transition: 'background 0.2s' }}>Submit</button>
    </form>
  );
};

const AboutSection = () => {
  return (
    <AboutContainer>
      <AboutCard>
        <ProfileSection>
          <ProfileImage src="/Priyobroto_Karmakar.jpg" alt="Priyobroto Karmakar" />
          <ProfileInfo>
            <Title>Priyobroto Karmakar</Title>
            <Subtitle>Creator of Code Analyzer</Subtitle>
            <SocialLinks style={{ justifyContent: 'flex-start', margin: '1rem 0' }}>
              <SocialLink href="https://github.com/PriyobrotoKarmakar" target="_blank" rel="noopener noreferrer">
                <Github size={18} />
                GitHub
              </SocialLink>
              <SocialLink href="https://www.linkedin.com/in/priyobroto-karmakar/" target="_blank" rel="noopener noreferrer">
                <img src="/Priyobroto_Karmakar.jpg" alt="LinkedIn" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                LinkedIn
              </SocialLink>
            </SocialLinks>
            <Description>
              <p>
                Welcome to Code Analyzer! This interactive web app helps you visualize, debug, and understand code complexity with modern UI and real-time feedback. Built for students, educators, and developers who want to explore algorithms and code performance in a fun, intuitive way.
              </p>
            </Description>
          </ProfileInfo>
        </ProfileSection>

        <FeatureGrid>
          <FeatureCard>
            <h3>
              <Code2 size={20} style={{ color: '#8a2be2' }} />
              Complexity Analysis
            </h3>
            <p>
              Analyze time and space complexity of your algorithms with detailed 
              explanations and visual representations.
            </p>
          </FeatureCard>

          <FeatureCard>
            <h3>
              <Coffee size={20} style={{ color: '#8a2be2' }} />
              Smart Debugging
            </h3>
            <p>
              Get intelligent debugging assistance to identify and fix issues 
              in your code efficiently.
            </p>
          </FeatureCard>

          <FeatureCard>
            <h3>
              <Heart size={20} style={{ color: '#8a2be2' }} />
              Code Generation
            </h3>
            <p>
              Generate high-quality code snippets and solutions for various 
              programming challenges and tasks.
            </p>
          </FeatureCard>
        </FeatureGrid>

        <Description>
          <p>
            Built with React, Vite, and modern JavaScript, Code Analyzer offers interactive visualizations, code input, and debugging tools. Whether you're learning algorithms, preparing for interviews, or just curious about how your code performs, this tool is designed to help you succeed and grow as a developer.
          </p>
        </Description>

  {/* Social links removed from bottom. Only feedback section remains below features. */}

        <FeatureCard style={{ marginTop: '2rem', textAlign: 'center', background: 'rgba(138,43,226,0.08)', boxShadow: '0 4px 24px rgba(138,43,226,0.08)' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 700 }}>Feedback</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1rem' }}>We value your feedback! Please share your thoughts, suggestions, or issues below:</p>
          {/* Interactive feedback form with rating and file preview */}
          <FeedbackForm />
        </FeatureCard>

      </AboutCard>
    </AboutContainer>
  );
};

export default AboutSection;
