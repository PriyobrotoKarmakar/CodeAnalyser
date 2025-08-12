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

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8a2be2, #4b0082);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: ${props => props.theme.name === 'dark' 
      ? 'rgba(0, 0, 0, 0.5)' 
      : 'rgba(255, 255, 255, 0.1)'};
  }

  span {
    position: relative;
    z-index: 1;
  }
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

  p {
    margin-bottom: 1rem;
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

const AboutSection = () => {
  return (
    <AboutContainer>
      <AboutCard>
        <ProfileSection>
          <ProfileImage>
            <span>🧑🏻‍🦱</span>
          </ProfileImage>
          <ProfileInfo>
            <Title>Code Analyzer</Title>
            <Subtitle>Advanced Code Analysis & Generation Tool</Subtitle>
            <Description>
              <p>
                Welcome to Code Analyzer! This powerful tool helps developers understand, 
                debug, and create better code through advanced analysis and AI-powered assistance.
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
            Built with modern web technologies including React, Django, and powered by 
            advanced AI models to provide you with the best coding experience. Whether 
            you're a beginner learning algorithms or an experienced developer optimizing 
            performance, this tool is designed to help you succeed.
          </p>
        </Description>

        <SocialLinks>
          <SocialLink href="#" target="_blank" rel="noopener noreferrer">
            <Github size={18} />
            GitHub
          </SocialLink>
          <SocialLink href="#" target="_blank" rel="noopener noreferrer">
            <Heart size={18} />
            Support
          </SocialLink>
        </SocialLinks>
      </AboutCard>
    </AboutContainer>
  );
};

export default AboutSection;
