import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function AccountTypeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/lawyalogo.png')} style={styles.logo} />

      <Text style={styles.heading}>Create an Account</Text>
      <Text style={styles.subheading}>Choose how you want to use our platform</Text>

      <Pressable style={styles.card} onPress={() => router.push('/client-registration')}>
        <Image source={require('@/assets/images/profile.png')} style={styles.icon} />
        <View>
          <Text style={styles.cardTitle}>I’m a Client</Text>
          <Text style={styles.cardText}>Looking for legal services and consultation</Text>
        </View>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/lawyer-registration')}>
        <Image source={require('@/assets/images/lawyer.png')} style={styles.icon} />
        <View>
          <Text style={styles.cardTitle}>I’m a Lawyer</Text>
          <Text style={styles.cardText}>Offering legal services and expertise</Text>
        </View>
      </Pressable>

      <View style={styles.signinRow}>
        <Text style={styles.signinText}>Already have an account?</Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.signinLink}> Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    width: '100%',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 14,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 13,
    color: '#555',
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signinText: {
    fontSize: 14,
    color: '#444',
  },
  signinLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
});
