import java.io.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import javax.swing.*;

// creazione di una classe swing
public class GIACARDI extends JFrame {
	static DefaultListModel<String> FGelencoVoci = new DefaultListModel<String>();;
	static DefaultListModel<String> FGelencoVociSelezionate = new DefaultListModel<String>();
	static JList FGlista;
	static JList FGlistaSelezionati;

	static JButton FGBtnUno = new JButton("RIMUOVI");
	static JButton FGBtnDue = new JButton("RESTITUITO");
	static JButton FGBtnTre = new JButton("CARICA");
	static JButton _FGBtnQuattro = new JButton("PRESTATO");

	static JTextField FGTxtUno = new JTextField();
	static JTextField FGTxtDue = new JTextField();
	static JTextField FGTxtTre = new JTextField();
	static JTextField FGTxtQuattro=new JTextField();

	public static void main(final String[] s) {
		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				FGavvio();
			}
		});
	}

	static void FGavvio() {
		JLabel FGLblUno = new JLabel("TIPO");
		JLabel FG_LblDue = new JLabel("TITOLO");
		JLabel FGLblTre = new JLabel("DATA");
		JLabel FGLblQuattro = new JLabel("NOMINATIVO");

		JPanel FGpanPrincTmp = new JPanel();
		JPanel FGpanSecTmp = new JPanel();
		// CREAZIONE DEI CONTENITORI DELLE LISTE

		// COSTRUZIONE FINESTRA DI PARTENZA
		GIACARDI FGclassePrincipale = new GIACARDI();
		FGclassePrincipale.setDefaultCloseOperation(EXIT_ON_CLOSE);
		FGclassePrincipale.setSize(250, 250);
		FGclassePrincipale.setVisible(true);
		FGclassePrincipale.setTitle(FGclassePrincipale.getClass().toString());

		// PREDISPOSIZIONE LAYOUT
		FGpanPrincTmp.setLayout(new GridLayout(3, 1));
		FGpanSecTmp.setLayout(new GridLayout(4, 3));

		FGlista = new JList<String>();
		FGlista.setModel(FGelencoVoci);
		FGlista.setBackground(Color.PINK);

		FGlistaSelezionati = new JList<String>();
		FGlistaSelezionati.setModel(FGelencoVociSelezionate);
		FGlistaSelezionati.setBackground(Color.CYAN);

		// INSERIMENTO COMPONENTI NEL FORM CENTRALE
		// Riga 1
		FGpanSecTmp.add(FGLblQuattro);

		FGTxtQuattro.setBackground(Color.GREEN);
		FGpanSecTmp.add(FGTxtQuattro);

		FGpanSecTmp.add(_FGBtnQuattro);

		// Riga 2
		FGpanSecTmp.add(FG_LblDue);

		FGpanSecTmp.add(FGTxtDue);

		FGpanSecTmp.add(FGBtnDue);

		// Riga 3
		FGpanSecTmp.add(FGLblTre);

		FGpanSecTmp.add(FGTxtTre);

		FGpanSecTmp.add(FGBtnTre);

		// Riga 4
		FGLblUno.setForeground(Color.RED);
		FGpanSecTmp.add(FGLblUno);

		JComboBox<String> cmbTipo = new JComboBox<String>();
		cmbTipo.addItem("ROMANZO");
		cmbTipo.addItem("GIALLO");
		cmbTipo.addItem("RIVISTA");
		cmbTipo.setSelectedIndex(-1);
		FGpanSecTmp.add(cmbTipo);

		FGpanSecTmp.add(FGBtnUno);

		// IMPOSTAZIONE DEI PANEL
		FGpanPrincTmp.add(FGlista);
		FGpanPrincTmp.add(FGpanSecTmp);
		FGpanPrincTmp.add(FGlistaSelezionati);
		FGclassePrincipale.add(FGpanPrincTmp);
		FGclassePrincipale.pack();
		

		// GESTIONE EVENTI PULSANTI
		FGBtnUno.addActionListener(new ActionListener() {
			public void actionPerformed(final ActionEvent e) {
				rimuovi_elemento();
			}
		});
		FGBtnDue.addActionListener(new ActionListener() {
			public void actionPerformed(final ActionEvent e) {
				evadi();

			}
		});
		FGBtnTre.addActionListener(new ActionListener() {
			public void actionPerformed(final ActionEvent e) {

				carica_elemento(cmbTipo);

			}
		});
		_FGBtnQuattro.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				PRESTITO();
			}
		});
	}

	static void carica_elemento(JComboBox<String> cmbTipo) {
		if (FGTxtDue.getText().length() > 0) {
			if (FGTxtTre.getText().length() > 0) {
				if (cmbTipo.getSelectedIndex() != -1) {
					FGelencoVociSelezionate.addElement(FGTxtDue.getText() + ";" + FGTxtTre.getText() + ";"
							+ (String) cmbTipo.getSelectedItem() + ";");
					FGTxtDue.setText("");
					FGTxtTre.setText("");
					cmbTipo.setSelectedIndex(-1);
					JOptionPane.showMessageDialog(null, "Dato Inserito con successo", "Operazione Completata",
							JOptionPane.INFORMATION_MESSAGE);
				} else {
					JOptionPane.showMessageDialog(null, "Selezionare il Tipo", "Errore dati di Input",
							JOptionPane.ERROR_MESSAGE);
				}
			} else {
				JOptionPane.showMessageDialog(null, "Inserire la Data", "Errore dati di Input",
						JOptionPane.ERROR_MESSAGE);
			}
		} else {
			JOptionPane.showMessageDialog(null, "Inserire il Titolo", "Errore dati di Input",
					JOptionPane.ERROR_MESSAGE);
		}
	}

	static void evadi() {
		if (FGlista.getSelectedIndex() != -1) {
			FGelencoVoci.removeElement(FGlista.getSelectedValue());
		} else {
			JOptionPane.showMessageDialog(null, "Selezionare il libro da evadere", "Elemento non selezionato",
					JOptionPane.ERROR_MESSAGE);
		}
	}

	static void rimuovi_elemento() {
		if (FGlistaSelezionati.getSelectedIndex() != -1) {
			FGelencoVociSelezionate.remove(FGlistaSelezionati.getSelectedIndex());
		} else {
			JOptionPane.showMessageDialog(null, "Selezionare il dato da rimuovere", "Elemento non selezionato",
					JOptionPane.ERROR_MESSAGE);
		}
	}

	static void PRESTITO() {
		if (FGlistaSelezionati.getSelectedIndex() != -1) {
			if (FGTxtQuattro.getText().length() > 0) {
				FGelencoVoci.addElement(FGTxtQuattro.getText() + ";" + (String) FGlistaSelezionati.getSelectedValue());
			} else {
				JOptionPane.showMessageDialog(null, "Inserire il Nominativo da Associare", "Errore Dati di Input",
						JOptionPane.ERROR_MESSAGE);
			}
		} else {
			JOptionPane.showMessageDialog(null, "Selezionare il dato da spostare", "Elemento non selezionato",
					JOptionPane.ERROR_MESSAGE);
		}
	}
}