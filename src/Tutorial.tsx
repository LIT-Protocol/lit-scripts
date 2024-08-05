import React, { useState } from "react";
import { motion } from "framer-motion";

const LitProtocolTutorial = () => {
  const [step, setStep] = useState(0);
  const [toyVisible, setToyVisible] = useState(true);
  const [friendsHelping, setFriendsHelping] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showAttestation, setShowAttestation] = useState(false);

  const steps = [
    {
      title: "Welcome to the Magical Lit Protocol World!",
      content:
        "Lit Protocol helps keep your digital treasures safe and private. Let's explore!",
      action: "Start Adventure",
    },
    {
      title: "The Magical Toy (Your Data)",
      content:
        "This toy represents your data. In Lit Protocol, we want to keep it safe!",
      action: "Next",
    },
    {
      title: "Locking the Toy (Encryption)",
      content:
        "Let's put the toy in a magical box. This is like encrypting your data!",
      action: "Lock Toy",
    },
    {
      title: "Toy Locked!",
      content:
        "The toy is now encrypted. Only people with the right spell can see it again.",
      action: "Next",
    },
    {
      title: "The Guardians (Lit Nodes)",
      content:
        "To keep the toy safe, we have special guardians. They're like the Lit Nodes!",
      action: "Meet Guardians",
    },
    {
      title: "Guardian's Secret Spell (BLS Signatures)",
      content:
        "Each guardian knows part of a secret spell. This is like BLS signatures in Lit!",
      action: "Cast Spell",
    },
    {
      title: "Unlocking the Toy (Decryption)",
      content:
        "To get the toy back, we need help from the guardians. Each shares their part of the spell.",
      action: "Ask Guardians",
    },
    {
      title: "Guardians Helping",
      content:
        "When enough guardians help, the toy will reappear! This is threshold cryptography.",
      action: "Combine Spells",
    },
    {
      title: "Toy Unlocked!",
      content:
        "Great job! You've decrypted the toy with help from the guardians.",
      action: "Next",
    },
    {
      title: "Magic Sticker (Digital Signature)",
      content:
        "Let's put a special sticker on the toy. This proves it's really yours!",
      action: "Add Sticker",
    },
    {
      title: "Sticker Added!",
      content:
        "Now anyone can check if the toy is really from you. This is like a digital signature!",
      action: "Next",
    },
    {
      title: "Guardian's Secret Room (SEV-SNP)",
      content:
        "Each guardian has a secret room where they keep their magic safe. This is like SEV-SNP!",
      action: "Peek Inside",
    },
    {
      title: "Room Verified!",
      content:
        "We checked the secret room and it's secure. This is like verifying node attestations in Lit.",
      action: "Finish Adventure",
    },
  ];

  const handleNext = () => {
    if (step === 2) {
      setToyVisible(false);
      setShowEncryption(true);
    }
    if (step === 7 && friendsHelping < 3) {
      setFriendsHelping(friendsHelping + 1);
    } else {
      if (step === 8) setToyVisible(true);
      if (step === 9) setShowSignature(true);
      if (step === 11) setShowAttestation(true);
      setStep(step + 1);
      if (step === 7) setFriendsHelping(0);
    }
  };

  const renderToy = () => (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: toyVisible ? 1 : 0, rotateY: showEncryption ? 180 : 0 }}
      transition={{ duration: 0.5 }}
      className="w-16 h-16 bg-red-400 rounded-full mx-auto mb-4 relative"
    >
      {showEncryption && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-white"
        >
          🔒
        </motion.div>
      )}
    </motion.div>
  );

  const renderGuardians = () => (
    <div className="flex justify-center mb-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: i < friendsHelping ? 1 : 0 }}
          transition={{ duration: 0.3, delay: i * 0.2 }}
          className="w-8 h-8 bg-blue-400 rounded-full mx-1 flex items-center justify-center text-white font-bold"
        >
          {i + 1}
        </motion.div>
      ))}
    </div>
  );

  const renderSignature = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full"
    />
  );

  const renderAttestation = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-16 h-16 bg-purple-400 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold"
    >
      SEV
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl relative">
      <h1 className="text-2xl font-bold mb-4">{steps[step].title}</h1>
      <p className="mb-4">{steps[step].content}</p>
      {step >= 1 && step <= 10 && renderToy()}
      {step === 7 && renderGuardians()}
      {step === 10 && showSignature && renderSignature()}
      {step === 12 && showAttestation && renderAttestation()}
      <button
        onClick={handleNext}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {steps[step].action}
      </button>
    </div>
  );
};

export default LitProtocolTutorial;
